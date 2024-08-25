// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Button, Buttons } from 'ui/components/common/Button';
import { useApi } from 'ui/contexts';
import { Error } from './Error';

export function ConnectWallet() {
  const { endpoint, status, setStatus } = useApi();

  return (
    <Error>
      <div>Connect Your Wallet</div>
      {/* <Button className=" outline" onClick={() => setStatus('loading')}>
        Connect Wallet
      </Button> */}

      <Buttons>
        <Button data-cy="next-btn" onClick={() => setStatus('loading')} variant="primary">
          Connect Wallet
        </Button>
      </Buttons>
    </Error>
  );
}
