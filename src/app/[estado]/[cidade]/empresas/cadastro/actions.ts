'use server';

export type CadastroState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export async function submitCadastroEmpresa(prevState: CadastroState, formData: FormData): Promise<CadastroState> {
  const cnpj = formData.get('cnpj') as string;
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;
  const termos = formData.get('termos');

  if (!cnpj || !email || !senha) {
    return {
      success: false,
      error: 'Preencha todos os campos obrigatórios (CNPJ, Email e Senha).',
      message: null
    };
  }

  if (senha.length < 6) {
    return {
      success: false,
      error: 'A senha deve conter no mínimo 6 caracteres.',
      message: null
    };
  }

  if (!termos) {
    return {
      success: false,
      error: 'Você deve aceitar os termos de uso.',
      message: null
    };
  }

  // Simulating Database Insert (Vercel compatible persistence mock)
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    error: null,
    message: 'Conta criada com sucesso! Analisaremos sua solicitação e você receberá um email de confirmação em breve.'
  };
}
