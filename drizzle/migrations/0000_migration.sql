CREATE TABLE public.confirmacoes_presenca (
  id uuid PRIMARY KEY,
  nome_convidado text NOT NULL CHECK (char_length(nome_convidado) BETWEEN 2 AND 120),
  assinatura_caminho text NOT NULL,
  confirmado_em timestamptz NOT NULL DEFAULT now()
);

-- Only trusted server code (service role) writes or reads this table.
GRANT ALL ON public.confirmacoes_presenca TO service_role;

ALTER TABLE public.confirmacoes_presenca ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: visitors can neither read nor write directly.

CREATE INDEX confirmacoes_presenca_confirmado_em_idx ON public.confirmacoes_presenca (confirmado_em DESC);

COMMENT ON TABLE public.confirmacoes_presenca IS 'Confirmações de presença do aniversário da Seraphine. Assinaturas ficam no armazenamento privado "assinaturas".';