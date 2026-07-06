export interface Moto {
  id: number;
  modelo: string;
  marca: string;
  preco_diaria: number;
  disponivel: number;
  imagem?: string | null;
  cc?: string;
  cv?: string;
  torque?: string;
  tipo?: string;
}