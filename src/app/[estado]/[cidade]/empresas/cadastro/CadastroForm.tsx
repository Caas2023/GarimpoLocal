'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { submitCadastroEmpresa, CadastroState } from './actions';

export function CadastroForm({ baseUrl, loginUrl }: { baseUrl: string, loginUrl: string }) {
  const [state, formAction, pending] = useActionState(submitCadastroEmpresa, { success: false, error: null, message: null } as CadastroState);

  if (state.success) {
    return (
      <div className="bg-[#FFFFF0] border border-[#005f73] rounded-lg p-6 text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[#005f73] mb-2">Cadastro Realizado</h2>
        <p className="text-gray-700 mb-6">{state.message}</p>
        <Link 
          href={loginUrl}
          className="inline-block bg-[#f77f00] text-white px-6 py-3 rounded-md font-semibold transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#f77f00] focus:ring-offset-2"
        >
          Acessar minha conta
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 space-y-6">
      {state.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700" role="alert">
          <p>{state.error}</p>
        </div>
      )}

      <div>
        <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-800 mb-2">
          Nome da Empresa (Fantasia)
        </label>
        <input 
          type="text" 
          id="nomeFantasia" 
          name="nomeFantasia" 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="Ex: Padaria do João"
        />
      </div>

      <div>
        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-800 mb-2">
          CNPJ <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          id="cnpj" 
          name="cnpj" 
          required 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
          E-mail de Acesso <span className="text-red-500">*</span>
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
          Senha <span className="text-red-500">*</span>
        </label>
        <input 
          type="password" 
          id="senha" 
          name="senha" 
          required 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input 
            id="termos" 
            name="termos" 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-[#005f73] focus:ring-[#005f73]" 
            required
          />
        </div>
        <label htmlFor="termos" className="ml-3 text-sm text-gray-600">
          Eu concordo com os <a href="#" className="font-medium text-[#005f73] hover:underline">Termos de Uso</a> e <a href="#" className="font-medium text-[#005f73] hover:underline">Política de Privacidade</a> do portal.
        </label>
      </div>

      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Link 
          href={loginUrl}
          className="text-sm font-medium text-gray-600 hover:text-[#005f73] transition-colors"
        >
          Já possui conta? Faça login
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
            disabled={pending}
            className="bg-[#f77f00] text-white px-8 py-3 rounded-md font-semibold transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#f77f00] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {pending ? 'Criando Conta...' : 'Cadastrar Empresa'}
          </button>
        </div>
      </div>
    </form>
  );
}
