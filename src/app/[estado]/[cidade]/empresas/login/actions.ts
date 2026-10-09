'use server';

export type LoginState = {
  success: boolean;
  error: string | null;
};

export async function submitLoginEmpresa(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  if (!email || !senha) {
    return {
      success: false,
      error: 'Preencha o email e a senha.',
    };
  }

  // Simulating Database Check (Vercel compatible persistence mock)
  await new Promise(resolve => setTimeout(resolve, 600));

  // Mocking invalid credentials for demonstration unless it's a test account
  if (email === 'teste@empresa.com' && senha === '123456') {
    return {
      success: true,
      error: null,
    };
  }

  return {
    success: false,
    error: 'E-mail ou senha incorretos.',
  };
}
