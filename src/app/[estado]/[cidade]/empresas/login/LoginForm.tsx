'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitLoginEmpresa, LoginState } from './actions';

export function LoginForm({ baseUrl, cadastroUrl }: { baseUrl: string, cadastroUrl: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitLoginEmpresa, { success: false, error: null } as LoginState);

  useEffect(() => {
    if (state.success) {
      router.push(`${baseUrl}/painel`);
    }
  }, [state.success, router, baseUrl]);

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 space-y-6">
      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
          E-mail
        </label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="contato@empresa.com.br"
        />
      </div>

      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-gray-800 mb-2">
          Senha
        </label>
        <input 
          type="password" 
          id="senha" 
          name="senha" 
          required 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="Sua senha"
        />
      </div>

      <div className="flex justify-end">
        <a href="#" className="text-sm font-medium text-[#005f73] hover:underline">
          Esqueceu a senha?
        </a>
      </div>

      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Link 
          href={cadastroUrl}
          className="text-sm font-medium text-gray-600 hover:text-[#005f73] transition-colors"
        >
          Não tem conta? Cadastre-se
        </Link>
        <div className="flex gap-4">
          <Link 
            href={baseUrl}
            className="px-6 py-3 rounded-md font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={pending || state.success}
            className="bg-[#005f73] text-white px-8 py-3 rounded-md font-semibold transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-[#005f73] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {pending ? 'Entrando...' : (state.success ? 'Redirecionando...' : 'Entrar')}
          </button>
        </div>
      </div>
    </form>
  );
}
