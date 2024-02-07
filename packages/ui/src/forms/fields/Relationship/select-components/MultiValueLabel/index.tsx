import type { MultiValueProps } from 'react-select'

import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from '../../../../../providers/Translation'
import { components } from 'react-select'

import type { Option } from '../../types'

import { useDocumentDrawer } from '../../../../../elements/DocumentDrawer'
import { Tooltip } from '../../../../../elements/Tooltip'
import { Edit } from '../../../../../icons/Edit'
import { useAuth } from '../../../../../providers/Auth'
import './index.scss'

const baseClass = 'relationship--multi-value-label'

export const MultiValueLabel: React.FC<MultiValueProps<Option>> = (props) => {
  const {
    data: { label, relationTo, value },
    selectProps: {
      // @ts-ignore-next-line // TODO Fix this - moduleResolution 16 breaks our declare module
      customProps: {
        // @ts-ignore-next-line// TODO Fix this - moduleResolution 16 breaks our declare module
        draggableProps,
        // @ts-ignore-next-line // TODO Fix this - moduleResolution 16 breaks our declare module
        setDrawerIsOpen,
        // onSave,
      } = {},
    } = {},
  } = props

  const { permissions } = useAuth()
  const [showTooltip, setShowTooltip] = useState(false)
  const { t } = useTranslation()
  const hasReadPermission = Boolean(permissions?.collections?.[relationTo]?.read?.permission)

  const [DocumentDrawer, DocumentDrawerToggler, { isDrawerOpen }] = useDocumentDrawer({
    id: value?.toString(),
    collectionSlug: relationTo,
  })

  useEffect(() => {
    if (typeof setDrawerIsOpen === 'function') setDrawerIsOpen(isDrawerOpen)
  }, [isDrawerOpen, setDrawerIsOpen])

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__content`}>
        <components.MultiValueLabel
          {...props}
          innerProps={{
            className: `${baseClass}__text`,
            ...(draggableProps || {}),
          }}
        />
      </div>
      {relationTo && hasReadPermission && (
        <Fragment>
          <DocumentDrawerToggler
            aria-label={`Edit ${label}`}
            className={`${baseClass}__drawer-toggler`}
            onClick={() => setShowTooltip(false)}
            onMouseDown={(e) => e.stopPropagation()} // prevents react-select dropdown from opening
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchEnd={(e) => e.stopPropagation()} // prevents react-select dropdown from opening
          >
            <Tooltip className={`${baseClass}__tooltip`} show={showTooltip}>
              {t('general:editLabel', { label: '' })}
            </Tooltip>
            <Edit />
          </DocumentDrawerToggler>
          <DocumentDrawer onSave={/* onSave */ null} />
        </Fragment>
      )}
    </div>
  )
}