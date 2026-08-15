import { http } from "./http";
    
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Gates = { 
        id: number; 
        code: string;
        terminal: string;
        is_available: boolean;
        created_at: string;
        };

export async function listGatesApi() {
  const { data } = await http.get<Paginated<Gates>>("/api/gates/");
  return data; // { count, next, previous, results }
}

export async function createGateApi(nombre: string) {
  const { data } = await http.post<Gates>("/api/gates/", { nombre });
  return data;
}

export async function updateGateApi(id: number, nombre: string) {
  const { data } = await http.put<Gates>(`/api/gates/${id}/`, { nombre });
  return data;
}

export async function deleteGateApi(id: number) {
  await http.delete(`/api/gates/${id}/`);
}