'use server';

export type ActionState = {
  success: boolean;
  message: string | null;
  error: string | null;
};

export async function submitCorrection(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const nome = formData.get('nome');
  const email = formData.get('email');
  const descricao = formData.get('descricao');
  const tipo = formData.get('tipo');

  if (!nome || !email || !descricao || !tipo) {
    return { success: false, error: 'Todos os campos são obrigatórios.', message: null };
  }

  // Here it would save to a database or trigger an email

  return { success: true, message: 'Solicitação enviada com sucesso! Analisaremos os dados em até 48 horas.', error: null };
}