import { createSelector, MemoizedSelector } from '@ngrx/store';
import { EntitiesModel, SearchConfig, StateUtils } from '@spartacus/core';
import { Budget } from '../../model/budget.model';
import { denormalizeSearch } from '../../utils/serializer';
import {
  BudgetManagement,
  BUDGET_FEATURE,
  OrganizationState,
  StateWithOrganization,
} from '../organization-state';
import { getOrganizationState } from './feature.selector';

export const getBudgetManagementState: MemoizedSelector<
  StateWithOrganization,
  BudgetManagement
> = createSelector(
  getOrganizationState,
  (state: OrganizationState) => state[BUDGET_FEATURE]
);

export const getBudgetsState: MemoizedSelector<
  StateWithOrganization,
  StateUtils.EntityLoaderState<Budget>
> = createSelector(
  getBudgetManagementState,
  (state: BudgetManagement) => state && state.entities
);

export const getBudget = (
  budgetCode: string
): MemoizedSelector<StateWithOrganization, StateUtils.LoaderState<Budget>> =>
  createSelector(
    getBudgetsState,
    (state: StateUtils.EntityLoaderState<Budget>) =>
      StateUtils.entityLoaderStateSelector(state, budgetCode)
  );

export const getBudgetList = (
  params: SearchConfig
): MemoizedSelector<
  StateWithOrganization,
  StateUtils.LoaderState<EntitiesModel<Budget>>
> =>
  createSelector(getBudgetManagementState, (state: BudgetManagement) =>
    denormalizeSearch<Budget>(state, params)
  );
