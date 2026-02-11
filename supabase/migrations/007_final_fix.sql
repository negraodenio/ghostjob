-- SOLUÇÃO FINAL: Política super simples que GARANTE funcionar

-- Primeiro, ver todas as políticas existentes (para debug)
-- SELECT policyname FROM pg_policies WHERE tablename = 'applications';

-- Remover TODAS as políticas existentes de applications
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'applications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON applications', pol.policyname);
    END LOOP;
END $$;

-- Criar UMA ÚNICA política que permite INSERT para todos
CREATE POLICY "allow_all_inserts"
ON applications
FOR INSERT
WITH CHECK (true);

-- Garantir que a política se aplica a todos os roles
ALTER POLICY "allow_all_inserts" ON applications TO public;

-- Garantir permissões de tabela
GRANT INSERT ON TABLE applications TO anon, authenticated;

-- Para SELECT, criar políticas separadas
CREATE POLICY "allow_own_select"
ON applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "allow_public_select"
ON applications
FOR SELECT
TO anon
USING (is_public = true);

-- Para UPDATE
CREATE POLICY "allow_own_update"
ON applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
