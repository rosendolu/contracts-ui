// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { isWeb3Injected } from '@polkadot/extension-dapp';
import { isKeyringLoaded } from 'lib/util';
import type { HTMLAttributes } from 'react';
import { useEffect, useState } from 'react';
import { ConnectionError, Loader } from 'ui/components/common';
import { ConnectWallet } from 'ui/components/common/ConnectWallet';
import { useApi, useDatabase } from 'ui/contexts';
import { AccountsError, ExtensionError } from './common/AccountsError';

export function AwaitApis({ children }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  const { accounts, api, endpoint, status, systemChainType } = useApi();

  const { db } = useDatabase();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'connect' || status === 'disconnect') return;
    !db && setMessage('Loading data...');
    status === 'loading' && setMessage(`Connecting to ${endpoint}...`);
    !isKeyringLoaded() && setMessage(`Loading accounts...`);
  }, [db, endpoint, api, status]);

  if (status === 'error') {
    return <ConnectionError />;
  }

  if (
    !isWeb3Injected &&
    status === 'connected' &&
    !systemChainType.isDevelopment &&
    isKeyringLoaded()
  ) {
    return <ExtensionError />;
  }

  if (isKeyringLoaded() && accounts?.length === 0) {
    return <AccountsError />;
  }

  return (
    <>
      {status === 'connect' || status === 'disconnect' ? (
        <ConnectWallet />
      ) : status === 'loading' || !db || !isKeyringLoaded() ? (
        <Loader isLoading message={message} />
      ) : (
        children
      )}
    </>
  );
}
