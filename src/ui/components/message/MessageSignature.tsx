// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { encodeTypeDef } from '@polkadot/types/create';
import { classes } from 'lib/util';
import type { AbiMessage, Registry } from 'types';
import { ArgSignature } from './ArgSignature';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  message: Partial<AbiMessage>;
  params?: unknown[];
  registry: Registry;
}

export function MessageSignature({
  className,
  message: { args, isConstructor, isMutating, isDefault, isPayable, method, returnType },
  params = [],
  registry,
}: Props) {
  return (
    <div className={classes('font-mono', isConstructor && 'constructor', className)}>
      <span
        className={
          isConstructor
            ? 'text-purple-700 dark:text-blue-400'
            : 'text-yellow-700 dark:text-yellow-400'
        }
      >
        {method}
      </span>
      (
      {args?.map((arg, index): React.ReactNode => {
        return (
          <ArgSignature
            arg={arg}
            key={`${name}-args-${index}`}
            registry={registry}
            value={params[index] ? (params[index] as string) : undefined}
          >
            {index < args.length - 1 && ', '}
          </ArgSignature>
        );
      })}
      )
      {!isConstructor && returnType && (
        <>
          : <span>{encodeTypeDef(registry, returnType)}</span>
        </>
      )}
      {isMutating ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="ml-2 inline-block h-4 w-4 text-yellow-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="ml-2 inline-block h-4 w-4 text-green-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      )}
      {isPayable && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="ml-2 inline-block h-4 w-4 text-red-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      )}
      {/* {isMutating && (
        <>
          <DatabaseIcon className="ml-2 inline-block h-4 w-4 text-yellow-400" />
        </>
      )} */}
    </div>
  );
}
