import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { http } from '../api/http';
import { erro, type Ctx, type Resposta, type Rota } from './comum';
import { carregarDb, resetarDb, salvarDb } from './db';
import { rotasAuth } from './rotas/auth';
import { rotasAvisos } from './rotas/avisos';
import { rotasClinico } from './rotas/clinico';
import { rotasConsultas } from './rotas/consultas';
import { rotasPets } from './rotas/pets';
import { rotasUsuarios } from './rotas/usuarios';

const ROTAS: Rota[] = [
  ...rotasAuth, ...rotasUsuarios, ...rotasPets, ...rotasConsultas, ...rotasClinico, ...rotasAvisos,
];

// "/Pets/:id" vira uma expressão regular com grupos nomeados
const compilar = (caminho: string) =>
  new RegExp('^' + caminho.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
const COMPILADAS = ROTAS.map((rota) => ({ rota, regex: compilar(rota.caminho) }));

function lerCorpo(data: unknown): unknown {
  if (typeof data !== 'string') return data ?? {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function processar(config: InternalAxiosRequestConfig): Resposta {
  const metodo = (config.method ?? 'get').toUpperCase();
  const caminho = (config.url ?? '').split('?')[0];
  const db = carregarDb();

  const bruto = lerCorpo(config.data);
  const corpo =
    typeof bruto === 'object' && bruto !== null && !Array.isArray(bruto)
      ? (bruto as Record<string, unknown>)
      : {};
  const q = Object.fromEntries(Object.entries(config.params ?? {}).map(([k, v]) => [k, String(v)]));

  // O token do modo de exemplo é "mock-<id do usuário>"
  const auth = String(config.headers.get('Authorization') ?? '');
  const m = /^Bearer mock-(\d+)$/.exec(auth);
  const u = m ? (db.usuarios.find((x) => x.id === Number(m[1]) && x.ativo) ?? null) : null;

  for (const { rota, regex } of COMPILADAS) {
    if (rota.metodo !== metodo) continue;
    const achou = regex.exec(caminho);
    if (!achou) continue;

    const ctx: Ctx = { db, u, corpo, bruto, p: achou.groups ?? {}, q };
    try {
      let resp: Resposta;
      if (rota.publica) resp = rota.h(ctx);
      else if (!ctx.u) resp = erro(401, 'Sessão expirada. Faça login novamente.');
      else if (rota.perfis && !rota.perfis.includes(ctx.u.perfil)) {
        resp = erro(403, 'Você não tem permissão para esta ação.');
      } else resp = rota.h({ ...ctx, u: ctx.u });

      salvarDb(db);
      return resp;
    } catch {
      return erro(500, 'Erro interno no modo de exemplo.');
    }
  }
  return erro(404, `Rota não implementada no modo de exemplo: ${metodo} ${caminho}`);
}

const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 200)); // simula a rede
  const { status, corpo } = processar(config);
  const response: AxiosResponse = {
    data: corpo, status, statusText: String(status), headers: {}, config, request: {},
  };
  if (status >= 200 && status < 300) return response;
  throw new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response
  );
};

export function ativarMock(): void {
  http.defaults.adapter = mockAdapter;
  (window as unknown as { petcareMockReset: () => void }).petcareMockReset = () => {
    resetarDb();
    window.location.reload();
  };
  console.info(
    '%cPetCare: MODO DE EXEMPLO ativo (sem backend). Para restaurar os dados: petcareMockReset()',
    'color:#0d9488;font-weight:bold'
  );
}