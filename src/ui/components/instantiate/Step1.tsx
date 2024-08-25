// Copyright 2022-2024 use-ink/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApi, useDatabase, useInstantiate } from 'ui/contexts';
import { useDbQuery } from 'ui/hooks';
import { useNonEmptyString } from 'ui/hooks/useNonEmptyString';
import { AccountSelect } from '../account';
import { Loader } from '../common/Loader';
import { Form, FormField, Input, InputFile, getValidation, useMetadataField } from '../form';
import { MessageDocs } from '../message';
import { Metadata } from '../metadata';
import { CodeHash } from './CodeHash';

import { fileToFileState } from 'lib/fileToFileState';
import { getContractFromPatron } from 'lib/getContractFromPatron';
import { Button, Buttons } from 'ui/components/common';
import { useAccountAvailable } from 'ui/hooks/useAccountAvailable';

export function Step1() {
  const navigate = useNavigate();
  const { codeHash: codeHashUrlParam } = useParams<{ codeHash: string }>();
  const { db } = useDatabase();
  const [codeBundle] = useDbQuery(
    () => (codeHashUrlParam ? db.codeBundles.get({ codeHash: codeHashUrlParam }) : undefined),
    [codeHashUrlParam, db],
  );

  const { accounts, setStatus } = useApi();
  const { setStep, setData, data, step } = useInstantiate();

  const [accountId, setAccountId] = useState('');
  const isAccountAvailable = useAccountAvailable(accountId);
  const { value: name, onChange: setName, ...nameValidation } = useNonEmptyString();

  const {
    file,
    value: metadata,
    isLoading,
    isStored,
    onChange,
    onRemove,
    ...metadataValidation
  } = useMetadataField();

  useEffect(() => {
    const patronCodeHash = new URL(window.location.href).searchParams.get('patron');

    if (!codeHashUrlParam && patronCodeHash) {
      getContractFromPatron(patronCodeHash)
        .then(fileToFileState)
        .then(patronFileState => {
          onChange(patronFileState);
        })
        .catch(e => console.error(`Failed fetching contract from Patron.works: ${e}`));
    }
  }, [codeHashUrlParam]);

  useEffect(
    function updateNameFromMetadata(): void {
      if (metadataValidation.name && !name && !nameValidation.isTouched) {
        setName(metadataValidation.name);
      }
    },
    [metadataValidation.name, name, nameValidation, setName],
  );

  useEffect((): void => {
    if (!accounts || accounts.length === 0) return;
    setAccountId(accounts[0].address);
  }, [accounts]);

  function submitStep1() {
    setData &&
      setData({
        ...data,
        accountId,
        metadata,
        name,
        codeHash: codeHashUrlParam,
      });

    setStep(2);
  }

  if (step !== 1) return null;

  return (
    <Loader isLoading={isLoading}>
      <Form>
        <FormField
          help="The account to use for this instantiation. The fees and storage deposit will be deducted from this account."
          id="accountId"
          label="Account"
          isError={isAccountAvailable === false}
          message="Selected Account is not available to sign extrinsics."
        >
          <div className="flex w-full">
            <AccountSelect
              className="mb-2 flex-1"
              id="accountId"
              onChange={setAccountId}
              value={accountId}
            />
            {/* <button
              style={{ border: '1px solid #3a424e', borderRadius: '4px' }}
              className="flex-0 text-primay m-4 inline-block p-2"
              onClick={() => {
                setStatus('disconnect');
                navigate('/');
              }}
            >
              Change Wallet
            </button> */}
            <Buttons>
              <Button
                data-cy="next-btn"
                className="m-4"
                onClick={() => {
                  setStatus('disconnect');
                  navigate('/');
                }}
                variant="primary"
              >
                Change Wallet
              </Button>
            </Buttons>
          </div>
        </FormField>
        <FormField
          help="A name for the new contract to help users distinguish it. Only used for display purposes."
          id="name"
          label="Contract Name"
          {...nameValidation}
        >
          <Input
            id="contractName"
            onChange={setName}
            placeholder="Give your contract a descriptive name"
            value={name}
          />
        </FormField>
        {codeHashUrlParam && codeBundle && (
          <FormField
            help="The on-chain code hash that will be reinstantiated as a new contract."
            id="metadata"
            label="On-Chain Code"
          >
            <CodeHash codeHash={codeHashUrlParam} name={codeBundle.name} />
          </FormField>
        )}

        {(!codeHashUrlParam || !isStored) && (
          <FormField
            help={
              codeHashUrlParam && !isStored
                ? 'The contract metadata JSON file to save for this contract. Constructor and message information will be derived from this file.'
                : 'The contract bundle file containing the WASM blob and metadata.'
            }
            id="metadata"
            label={codeHashUrlParam ? 'Upload Metadata' : 'Upload Contract Bundle'}
            {...getValidation(metadataValidation)}
          >
            <InputFile
              isError={metadataValidation.isError}
              onChange={onChange}
              onRemove={onRemove}
              placeholder="Click to select or drag and drop to upload file."
              value={file}
            />
          </FormField>
        )}
      </Form>

      {metadata && (
        <>
          <label className="mb-1.5 inline-flex items-center text-sm font-semibold text-gray-600 dark:text-white">
            Metadata
          </label>

          <div className="mb-4 grid gap-4">
            <Metadata metadata={metadata} />

            {metadata.constructors.concat(metadata.messages).map(message => (
              <MessageDocs
                defaultOpen={false}
                key={message.identifier}
                message={message}
                registry={metadata.registry}
              />
            ))}

            {codeHashUrlParam && (
              <FormField
                help="Change the metadata associated with this contract."
                id="metadata"
                label="Update Metadata"
                {...(file ? getValidation(metadataValidation) : { message: '' })}
                className="mt-1.5"
              >
                <InputFile
                  isError={metadataValidation.isError}
                  onChange={onChange}
                  onRemove={onRemove}
                  placeholder="Click to select or drag and drop to upload file."
                  value={file}
                />
              </FormField>
            )}
          </div>
        </>
      )}

      {/* <Buttons>
        <Button
          data-cy="next-btn"
          isDisabled={
            !metadata ||
            !nameValidation.isValid ||
            !metadataValidation.isValid ||
            isAccountAvailable === false
          }
          onClick={submitStep1}
          variant="primary"
        >
          Next
        </Button>
      </Buttons> */}
    </Loader>
  );
}
