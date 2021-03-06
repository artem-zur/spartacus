import { createSelector, MemoizedSelector } from '@ngrx/store';
import { EntitiesModel, SearchConfig, StateUtils } from '@spartacus/core';
import {
  OrderApprovalPermissionType,
  Permission,
} from '../../model/permission.model';
import { denormalizeSearch } from '../../utils/serializer';
import {
  OrganizationState,
  PermissionManagement,
  PERMISSION_FEATURE,
  PERMISSION_TYPES,
  StateWithOrganization,
} from '../organization-state';
import { getOrganizationState } from './feature.selector';

export const getPermissionManagementState: MemoizedSelector<
  StateWithOrganization,
  PermissionManagement
> = createSelector(
  getOrganizationState,
  (state: OrganizationState) => state[PERMISSION_FEATURE]
);

export const getPermissionsState: MemoizedSelector<
  StateWithOrganization,
  StateUtils.EntityLoaderState<Permission>
> = createSelector(
  getPermissionManagementState,
  (state: PermissionManagement) => state && state.entities
);

export const getPermissionTypesState: MemoizedSelector<
  StateWithOrganization,
  StateUtils.EntityLoaderState<OrderApprovalPermissionType[]>
> = createSelector(
  getPermissionManagementState,
  (state: PermissionManagement) => state && state.permissionTypes
);

export const getPermission = (
  permissionCode: string
): MemoizedSelector<
  StateWithOrganization,
  StateUtils.LoaderState<Permission>
> =>
  createSelector(
    getPermissionsState,
    (state: StateUtils.EntityLoaderState<Permission>) =>
      StateUtils.entityLoaderStateSelector(state, permissionCode)
  );

export const getPermissionList = (
  params: SearchConfig
): MemoizedSelector<
  StateWithOrganization,
  StateUtils.LoaderState<EntitiesModel<Permission>>
> =>
  createSelector(getPermissionManagementState, (state: PermissionManagement) =>
    denormalizeSearch<Permission>(state, params)
  );

export const getPermissionTypes = (): MemoizedSelector<
  StateWithOrganization,
  StateUtils.LoaderState<OrderApprovalPermissionType[]>
> =>
  createSelector(
    getPermissionTypesState,
    (state: StateUtils.EntityLoaderState<OrderApprovalPermissionType[]>) =>
      StateUtils.entityLoaderStateSelector(state, PERMISSION_TYPES)
  );
