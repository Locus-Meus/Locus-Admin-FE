import { useEffect } from 'react';
import { useSessionStore } from '@/entities/session';
import { configureApiAuthHandlers } from '@/shared/api/base-api-client';
import {
  authenticateSilently,
  cancelSilentRefreshSchedule,
  handleAuthFailure,
  scheduleSilentRefresh,
} from '../model/silent-auth';

export const AuthSessionManager = () => {
  const isAuth = useSessionStore((state) => state.isAuth);
  const expiresAt = useSessionStore((state) => state.expiresAt);

  useEffect(() => {
    configureApiAuthHandlers({
      recoverUnauthorizedRequest: async () => {
        await authenticateSilently();
        return true;
      },
      onAuthFailure: handleAuthFailure,
    });
  }, []);

  useEffect(() => {
    if (!isAuth) {
      cancelSilentRefreshSchedule();
      return;
    }

    scheduleSilentRefresh(expiresAt);

    return () => {
      cancelSilentRefreshSchedule();
    };
  }, [expiresAt, isAuth]);

  return null;
};
