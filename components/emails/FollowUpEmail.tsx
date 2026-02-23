import * as React from 'react';

interface FollowUpEmailProps {
    jobTitle: string;
    companyName: string;
    applicationId: string;
    userName?: string;
    daysSinceApplied?: number;
}

export const FollowUpEmail: React.FC<Readonly<FollowUpEmailProps>> = ({
    jobTitle,
    companyName,
    applicationId,
    userName = 'there',
    daysSinceApplied = 7,
}) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostjob.app';

    return (
        <div style={{
            backgroundColor: '#0A0A0A',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            padding: '0',
            margin: '0',
            width: '100%',
        }}>
            {/* Email Container */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#0A0A0A' }}>
                <tbody>
                    <tr>
                        <td align="center" style={{ padding: '40px 20px' }}>
                            <table width="600" cellPadding="0" cellSpacing="0" style={{
                                maxWidth: '600px',
                                width: '100%',
                            }}>
                                {/* Header */}
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '0 0 32px 0' }}>
                                            <table width="100%" cellPadding="0" cellSpacing="0">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <span style={{ fontSize: '24px', marginRight: '8px' }}>👻</span>
                                                            <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>GhostJob</span>
                                                        </td>
                                                        <td align="right">
                                                            <span style={{ color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: 700 }}>
                                                                Day {daysSinceApplied} Check-in
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    {/* Main Content Card */}
                                    <tr>
                                        <td style={{
                                            backgroundColor: '#141414',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            padding: '40px 36px',
                                        }}>
                                            <h1 style={{
                                                color: '#FFFFFF',
                                                fontSize: '28px',
                                                fontWeight: 800,
                                                margin: '0 0 8px 0',
                                                lineHeight: '1.2',
                                                letterSpacing: '-0.02em',
                                            }}>
                                                Quick check-in
                                            </h1>

                                            <p style={{ color: '#9CA3AF', fontSize: '15px', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                                                Hi {userName}, it&apos;s been <strong style={{ color: '#FFFFFF' }}>{daysSinceApplied} days</strong> since you applied for:
                                            </p>

                                            {/* Job Card */}
                                            <table width="100%" cellPadding="0" cellSpacing="0" style={{
                                                backgroundColor: '#0A0A0A',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                marginBottom: '32px',
                                            }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ padding: '20px 24px' }}>
                                                            <div style={{ color: '#FFFFFF', fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
                                                                {jobTitle}
                                                            </div>
                                                            <div style={{ color: '#8B5CF6', fontSize: '14px', fontWeight: 600 }}>
                                                                {companyName}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <p style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
                                                Did you hear back from them?
                                            </p>

                                            {/* CTA Buttons */}
                                            <table width="100%" cellPadding="0" cellSpacing="0">
                                                <tbody>
                                                    <tr>
                                                        <td style={{ paddingRight: '8px', width: '50%' }}>
                                                            <a
                                                                href={`${appUrl}/api/applications/${applicationId}/outcome?status=responded`}
                                                                style={{
                                                                    display: 'block',
                                                                    backgroundColor: '#8B5CF6',
                                                                    color: '#FFFFFF',
                                                                    textDecoration: 'none',
                                                                    borderRadius: '10px',
                                                                    padding: '14px 0',
                                                                    textAlign: 'center' as const,
                                                                    fontWeight: 700,
                                                                    fontSize: '14px',
                                                                }}
                                                            >
                                                                ✅ Yes, I heard back
                                                            </a>
                                                        </td>
                                                        <td style={{ paddingLeft: '8px', width: '50%' }}>
                                                            <a
                                                                href={`${appUrl}/api/applications/${applicationId}/outcome?status=ghosted`}
                                                                style={{
                                                                    display: 'block',
                                                                    backgroundColor: 'transparent',
                                                                    color: '#9CA3AF',
                                                                    textDecoration: 'none',
                                                                    borderRadius: '10px',
                                                                    padding: '14px 0',
                                                                    textAlign: 'center' as const,
                                                                    fontWeight: 700,
                                                                    fontSize: '14px',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                }}
                                                            >
                                                                👻 Still ghosted
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    {/* Impact Message */}
                                    <tr>
                                        <td style={{ padding: '28px 0' }}>
                                            <table width="100%" cellPadding="0" cellSpacing="0" style={{
                                                backgroundColor: 'rgba(139,92,246,0.06)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(139,92,246,0.12)',
                                            }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ padding: '20px 24px' }}>
                                                            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                                                                <strong style={{ color: '#8B5CF6' }}>Why this matters:</strong> Your click updates the company&apos;s
                                                                <strong style={{ color: '#FFFFFF' }}> Hiring Integrity Score™</strong> — helping thousands of job seekers
                                                                avoid ghost postings. One click, real impact.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    {/* Footer */}
                                    <tr>
                                        <td style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                                            <table width="100%" cellPadding="0" cellSpacing="0">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                                                Sent by <strong>GhostProof Intelligence™</strong> — Hiring Transparency Infrastructure
                                                            </p>
                                                            <p style={{ color: '#374151', fontSize: '11px', margin: 0 }}>
                                                                <a
                                                                    href={`${appUrl}/api/applications/${applicationId}/outcome?status=withdrawn`}
                                                                    style={{ color: '#6B7280', textDecoration: 'underline' }}
                                                                >
                                                                    Stop follow-ups for this application
                                                                </a>
                                                            </p>
                                                        </td>
                                                        <td align="right" style={{ verticalAlign: 'top' }}>
                                                            <a href={appUrl} style={{ color: '#6B7280', fontSize: '11px', textDecoration: 'none' }}>
                                                                ghostjob.app
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
