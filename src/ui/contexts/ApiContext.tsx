// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3EnablePromise } from '@polkadot/extension-dapp';
import { keyring } from '@polkadot/ui-keyring';
import { isKeyringLoaded, isValidWsUrl } from 'lib/util';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getChainProperties } from 'src/services/chain/chainProps';
import { Account, ApiPromise, ApiState, ChainProperties, Status, WeightV2 } from 'types';
import { NoticeBanner } from 'ui/components/common/NoticeBanner';
import { useLocalStorage } from 'ui/hooks/useLocalStorage';
import { LOCAL_STORAGE_KEY, ROCOCO_CONTRACTS } from '../../constants';

// fixes internal pjs type mismatch `Type 'string' is not assignable to type '`0x${string}`'`
export interface InjectedAccountWithMetaOverride {
  address: string;
  meta: {
    genesisHash?: `0x{string}` | null;
    name?: string;
    source: string;
  };
}

export const ApiContext = createContext<ApiState | undefined>(undefined);

export const ApiContextProvider = ({ children }: React.PropsWithChildren<Partial<ApiState>>) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rpcUrl = searchParams.get('rpc');
  const [preferredEndpoint, setPreferredEndpoint] = useLocalStorage<string>(
    LOCAL_STORAGE_KEY.PREFERRED_ENDPOINT,
    ROCOCO_CONTRACTS.rpc,
  );
  const [api, setApi] = useState({} as ApiPromise);
  const [endpoint, setEndpoint] = useState(preferredEndpoint);
  const [accounts, setAccounts] = useState<Account[]>();
  const [chainProps, setChainProps] = useState<ChainProperties>();
  const [status, setStatus] = useState<Status>('connect');
  const [isSupported, setIsSupported] = useState(true);
  const [isEthereumChain, setIsEthereumChain] = useState(false);

  useEffect(() => {
    if (rpcUrl && isValidWsUrl(rpcUrl) && rpcUrl !== preferredEndpoint) {
      setEndpoint(rpcUrl);
      setPreferredEndpoint(rpcUrl);
      window.location.reload();
    }
  }, [preferredEndpoint, rpcUrl, searchParams, setPreferredEndpoint]);

  useEffect(() => {
    if (status !== 'loading') return;
    setStatus('loading');
    const wsProvider = new WsProvider(endpoint);
    const _api = new ApiPromise({ provider: wsProvider });
    _api.on('connected', async () => {
      await _api.isReady;
      const _chainProps = await getChainProperties(_api);
      const w2 = _api.registry.createType<WeightV2>('Weight').proofSize;
      const isEth = _api.runtimeVersion.specName.toString() === 'frontier-template';
      setApi(_api);
      setChainProps(_chainProps);
      setIsSupported(!!w2);
      setStatus('connected');
      setIsEthereumChain(isEth);
    });
    _api.on('disconnected', () => {
      // @ts-ignore
      status === 'connected' && setStatus('error');
    });
  }, [endpoint, status]);

  useEffect(() => {
    if (status === 'disconnect') {
      api && api.disconnect();
    }
  }, [api, status]);

  useEffect(() => {
    const getAccounts = async () => {
      if (status === 'connected' && chainProps) {
        !web3EnablePromise && (await web3Enable('contracts-ui'));
        const accounts = await web3Accounts();
        isKeyringLoaded() ||
          keyring.loadAll(
            {
              isDevelopment: chainProps.systemChainType.isDevelopment,
              type: isEthereumChain ? 'ethereum' : 'ed25519',
            },
            accounts as InjectedAccountWithMetaOverride[],
          );
        setAccounts(keyring.getAccounts());
        navigate('/home');
      }
    };
    getAccounts().catch(e => console.error(e));
  }, [chainProps, isEthereumChain, status]);

  return (
    <ApiContext.Provider
      value={{
        api,
        accounts,
        setStatus,
        setEndpoint,
        endpoint,
        status,
        ...(chainProps as ChainProperties),
      }}
    >
      <NoticeBanner endpoint={endpoint} isVisible={!isSupported} />
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiContextProvider');
  }
  return context;
};
