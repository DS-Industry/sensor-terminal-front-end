import { getPrograms } from '../api/services/program';
import useSWR from 'swr';
import useStore from '../components/state/store';
import { IProgram } from '../api/types/program';

// 1 час
const REFRESH_INTERVAL = 3600000;

export function usePrograms() {
  const { programs, setPrograms } = useStore();
  
  const swrResult = useSWR<IProgram[]>(
    'programs',
    getPrograms,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: REFRESH_INTERVAL, 
      onSuccess: (data) => {
        setPrograms(data)
      }
    }
  );
  
  return {
    ...swrResult,
    programs: swrResult.data || programs 
  };
}