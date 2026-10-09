'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { submitCorrection } from './actions';

export function CorrecaoForm({ baseUrl, companyName }: { baseUrl: string, companyName: string }) {
  const [state, formAction, pending] = useActionState(submitCorrection, { success: false, error: null, message: null });

  if (state.success) {
    return (
      <div className="bg-[#FFFFF0] border border-[#005f73] rounded-lg p-6 text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[#005f73] mb-2">Sucesso!</h2>
        <p className="text-gray-700 mb-6">{state.message}</p>
        <Link 
          href={baseUrl}
          className="inline-block bg-[#f77f00] text-white px-6 py-3 rounded-md font-semibold transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#f77f00] focus:ring-offset-2"
        >
          Voltar para {companyName}
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
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-800 mb-2">
          O que você deseja fazer?
        </label>
        <select 
          id="tipo" 
          name="tipo" 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73] bg-white text-gray-900"
          required
        >
          <option value="">Selecione uma opção</option>
          <option value="reivindicar">Sou o proprietário e quero reivindicar esta página</option>
          <option value="corrigir_dados">Sugerir correção de dados (telefone, endereço, etc)</option>
          <option value="reportar_fechado">Reportar que o local fechou permanentemente</option>
        </select>
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-800 mb-2">
          Seu Nome
        </label>
        <input 
          type="text" 
          id="nome" 
          name="nome" 
          required 
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="Ex: João da Silva"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
          Seu E-mail Institucional ou Pessoal
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
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-800 mb-2">
          Detalhes da Solicitação
        </label>
        <textarea 
          id="descricao" 
          name="descricao" 
          rows={5} 
          required
          className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 focus:border-[#005f73] focus:ring-[#005f73]"
          placeholder="Descreva a alteração sugerida ou os dados que comprovam a propriedade..."
        ></textarea>
        <p className="mt-2 text-sm text-gray-500">
          Para reivindicações, usaremos este email e enviaremos instruções de verificação.
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
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
          {pending ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </div>
    </form>
  );
}