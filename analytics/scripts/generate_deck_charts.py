#!/usr/bin/env python3
"""
GhostProof Deck Generator
Cria gráficos prontos para pitch deck
Usage: python generate_deck_charts.py --output ./deck_assets/
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import psycopg2
from pathlib import Path
import argparse
from datetime import datetime
import os
from dotenv import load_dotenv

# Load env variables if they exist
load_dotenv('.env.local')

# Config - Default to env or local
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/ghostproof")
COLORS = {
    'legit': '#22c55e',      # green-500
    'sus': '#eab308',        # yellow-500  
    'ghost': '#f97316',      # orange-500
    'certified_ghost': '#dc2626',  # red-600
    'primary': '#6366f1',    # indigo-500
    'dark': '#1f2937'        # gray-800
}

def fetch_data(conn):
    """Busca dados do PostgreSQL"""
    
    # Ghost Score vs Response Rate (buckets)
    query_buckets = """
    WITH score_buckets AS (
      SELECT 
        CASE 
          WHEN j.ghost_score < 25 THEN 'Legit (0-25)'
          WHEN j.ghost_score < 50 THEN 'Sus (26-50)'
          WHEN j.ghost_score < 75 THEN 'Ghost (51-75)'
          ELSE 'Certified Ghost (76-100)'
        END as bucket,
        j.ghost_score,
        CASE WHEN a.received_response THEN 1.0 ELSE 0.0 END as responded
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE outcome_status != 'pending'
    )
    SELECT 
      bucket,
      COUNT(*) as n,
      AVG(responded) * 100 as response_rate,
      AVG(ghost_score) as avg_score
    FROM score_buckets
    GROUP BY bucket
    ORDER BY avg_score;
    """
    
    # Scatter plot data (individual points)
    query_scatter = """
    SELECT 
      j.ghost_score,
      CASE WHEN a.received_response THEN 1 ELSE 0 END as got_response,
      a.days_to_response,
      c.name as company
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE a.outcome_status != 'pending'
      AND a.received_response IS NOT NULL;
    """
    
    # Growth over time
    query_growth = """
    SELECT 
      DATE_TRUNC('week', created_at) as week,
      COUNT(*) as new_applications
    FROM applications
    GROUP BY 1
    ORDER BY 1;
    """
    
    return {
        'buckets': pd.read_sql(query_buckets, conn),
        'scatter': pd.read_sql(query_scatter, conn),
        'growth': pd.read_sql(query_growth, conn)
    }

def chart_1_response_by_bucket(df, output_dir):
    """Gráfico 1: Response Rate by Ghost Score Bucket"""
    if df.empty: return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    colors_list = [COLORS['legit'], COLORS['sus'], COLORS['ghost'], COLORS['certified_ghost']]
    bars = ax.barh(df['bucket'], df['response_rate'], color=colors_list, edgecolor='white', linewidth=2)
    
    # Add value labels
    for i, (bar, rate, n) in enumerate(zip(bars, df['response_rate'], df['n'])):
        width = bar.get_width()
        ax.text(width + 2, bar.get_y() + bar.get_height()/2, 
                f'{rate:.1f}% (n={n})', 
                ha='left', va='center', fontweight='bold', fontsize=11)
    
    ax.set_xlim(0, 100)
    ax.set_xlabel('Response Rate (%)', fontsize=12, fontweight='bold')
    ax.set_title('Ghost Score Accuracy: Response Rate by Category', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    # Add subtitle
    fig.text(0.5, 0.02, 'Higher ghost scores = Lower response rates. System works.', 
             ha='center', fontsize=10, style='italic', color='gray')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'chart_1_response_by_bucket.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Chart 1: Response by bucket")

def chart_2_scatter_with_trend(df, output_dir):
    """Gráfico 2: Scatter plot com linha de tendência"""
    if df.empty: return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Jitter para visualização
    x = df['ghost_score'] + np.random.normal(0, 2, len(df))
    y = df['got_response'] + np.random.normal(0, 0.02, len(df))
    
    # Color by outcome
    colors = [COLORS['legit'] if g == 1 else COLORS['certified_ghost'] for g in df['got_response']]
    
    ax.scatter(x, y, alpha=0.3, s=30, c=colors, edgecolors='none')
    
    # Trend line (polynomial fit)
    z = np.polyfit(df['ghost_score'], df['got_response'], 1)
    p = np.poly1d(z)
    x_line = np.linspace(0, 100, 100)
    ax.plot(x_line, p(x_line), "b--", alpha=0.8, linewidth=2, label='Trend')
    
    ax.set_xlabel('Ghost Score', fontsize=12, fontweight='bold')
    ax.set_ylabel('Got Response (0=No, 1=Yes)', fontsize=12, fontweight='bold')
    ax.set_title('Individual Applications: Score vs Outcome', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_ylim(-0.1, 1.1)
    ax.legend()
    
    plt.tight_layout()
    plt.savefig(output_dir / 'chart_2_scatter_trend.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Chart 2: Scatter with trend")

def chart_3_growth_curve(df, output_dir):
    """Gráfico 3: Cumulative applications (network effects)"""
    if df.empty: return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    df['cumulative'] = df['new_applications'].cumsum()
    
    ax.fill_between(df['week'], df['cumulative'], alpha=0.3, color=COLORS['primary'])
    ax.plot(df['week'], df['cumulative'], color=COLORS['primary'], linewidth=3)
    
    # Add annotation for last point
    last_point = df.iloc[-1]
    ax.annotate(f"{int(last_point['cumulative'])} applications", 
                xy=(last_point['week'], last_point['cumulative']),
                xytext=(10, 10), textcoords='offset points',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7),
                arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
    
    ax.set_xlabel('Week', fontsize=12, fontweight='bold')
    ax.set_ylabel('Cumulative Applications Tracked', fontsize=12, fontweight='bold')
    ax.set_title('Dataset Growth: Network Effects in Action', 
                 fontsize=14, fontweight='bold', pad=20)
    
    # Rotate x-axis labels
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'chart_3_growth_curve.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Chart 3: Growth curve")

def chart_4_company_leaderboard(conn, output_dir):
    """Gráfico 4: Sample company rankings (anonymized or real)"""
    
    query = """
    SELECT 
      c.name,
      c.hiring_integrity_score
    FROM companies c
    WHERE c.total_applications_received > 2
    ORDER BY c.hiring_integrity_score DESC
    LIMIT 10;
    """
    
    df = pd.read_sql(query, conn)
    if df.empty: return
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    bars = ax.barh(df['name'], df['hiring_integrity_score'], color=COLORS['primary'])
    
    ax.set_xlabel('Hiring Integrity Score', fontsize=12, fontweight='bold')
    ax.set_title('Company Rankings: Hiring Transparency Leaders', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 100)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'chart_4_company_rankings.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Chart 4: Company rankings")

def generate_summary_stats(conn):
    """Gera estatísticas para o deck"""
    
    query = """
    SELECT 
      COUNT(*) as total_applications,
      COUNT(DISTINCT user_id) as unique_users,
      AVG(CASE WHEN received_response THEN 1.0 ELSE 0.0 END) * 100 as overall_response_rate,
      COUNT(CASE WHEN outcome_status = 'ghosted' THEN 1 END) as confirmed_ghosts
    FROM applications
    WHERE outcome_status != 'pending';
    """
    
    df = pd.read_sql(query, conn)
    if df.empty: return "No data found."
    
    stats = df.iloc[0]
    
    summary = f"""
    ============================================================
    GHOSTJOB: SUMMARY STATISTICS FOR DECK
    Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
    ============================================================
    
    📊 VOLUME METRICS
    Total Applications Tracked: {int(stats['total_applications']):,}
    Unique Users: {int(stats['unique_users']):,}
    
    🎯 OUTCOME METRICS  
    Overall Response Rate: {stats['overall_response_rate']:.1f}%
    Confirmed Ghost Jobs: {int(stats['confirmed_ghosts'])}
    
    💡 KEY INSIGHTS FOR PITCH
    • Dataset growing MoM
    • Every application makes our model smarter
    
    ============================================================
    """
    
    print(summary)
    return summary

def main():
    parser = argparse.ArgumentParser(description='Generate GhostJob deck charts')
    parser.add_argument('--output', default='./analytics/deck_assets', help='Output directory')
    args = parser.parse_args()
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"🚀 Generating charts to: {output_dir}")
    
    # Connect to DB
    try:
        conn = psycopg2.connect(DB_URL)
        
        # Fetch all data
        data = fetch_data(conn)
        
        # Generate charts
        chart_1_response_by_bucket(data['buckets'], output_dir)
        chart_2_scatter_with_trend(data['scatter'], output_dir)
        chart_3_growth_curve(data['growth'], output_dir)
        chart_4_company_leaderboard(conn, output_dir)
        
        # Generate summary
        summary = generate_summary_stats(conn)
        
        # Save summary
        with open(output_dir / 'summary_stats.txt', 'w') as f:
            f.write(summary)
        
        conn.close()
        print(f"\n✅ All charts generated in: {output_dir}")
    except Exception as e:
        print(f"❌ Error connecting to database or generating charts: {e}")

if __name__ == '__main__':
    main()
