import { useSnackbar } from 'notistack';

export function useCrudFeedback() {
  const { enqueueSnackbar } = useSnackbar();

  const onSuccess = (msg = '操作成功') => {
    enqueueSnackbar(msg, { variant: 'success' });
  };

  const onError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : '操作失败';
    enqueueSnackbar(msg, { variant: 'error' });
  };

  return { onSuccess, onError };
}
