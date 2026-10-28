import { ScrollToTop } from "@/components/common/ScrollToTop";
import { auth0Config, authMode, DEFAULT_RETURN_TO } from "@/lib/auth/config";
import { Auth0Provider } from "@auth0/auth0-react";
import { Outlet, useNavigate } from "react-router";

/**
 * Rota raiz: envolve todas as páginas no Auth0Provider.
 * Fica dentro do roteador para poder navegar após o retorno do login.
 */
export default function AuthProvider() {
  const navigate = useNavigate();

  const content = (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );

  if (authMode !== "auth0") return content;

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/login`,
        audience: auth0Config.audience,
      }}
      // Mantém a sessão ao recarregar a página, sem depender de cookies de terceiros
      useRefreshTokens
      cacheLocation="localstorage"
      onRedirectCallback={(appState) =>
        navigate(appState?.returnTo ?? DEFAULT_RETURN_TO, { replace: true })
      }
    >
      {content}
    </Auth0Provider>
  );
}
