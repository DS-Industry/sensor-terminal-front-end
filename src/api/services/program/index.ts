import { axiosInstance } from "../../axiosConfig";
import { ICommonApiResponse } from "../../types/common";
import { IProgram } from "../../types/program";

enum PROGRAM {
  PROGRAM = '/program',
};

export async function getPrograms(): Promise<IProgram[]> {
  const response = await axiosInstance.get<
    ICommonApiResponse<IProgram[]>
  >(PROGRAM.PROGRAM);

  return response.data.data;
}

export async function getProgramById(
  id: number,
): Promise<IProgram> {
  const response = await axiosInstance.get<
    ICommonApiResponse<IProgram>
  >(PROGRAM.PROGRAM + `/${id}`);

  return response.data.data;
}