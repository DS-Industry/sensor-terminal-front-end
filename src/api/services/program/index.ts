import { axiosInstance } from "../../axiosConfig";
import { IProgram } from "../../types/program";

enum PROGRAM {
  PROGRAM = 'wash-programs/',
};

export async function getPrograms(): Promise<IProgram[]> {
  const response = await axiosInstance.get<IProgram[]>(PROGRAM.PROGRAM);  
  return response.data;
}

export async function getProgramById(
  id: number,
): Promise<IProgram> {
  const response = await axiosInstance.get<IProgram>(PROGRAM.PROGRAM + `/${id}`);
  return response.data;
}