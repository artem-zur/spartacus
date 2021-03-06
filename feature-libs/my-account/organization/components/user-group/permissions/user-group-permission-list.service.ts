import { Injectable } from '@angular/core';
import { EntitiesModel } from '@spartacus/core';
import {
  Permission,
  UserGroupService,
} from '@spartacus/my-account/organization/core';
import { TableService, TableStructure } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { OrganizationSubListService } from '../../shared/organization-sub-list/organization-sub-list.service';
import { OrganizationTableType } from '../../shared/organization.model';

@Injectable({
  providedIn: 'root',
})
export class UserGroupPermissionListService extends OrganizationSubListService<
  Permission
> {
  protected tableType = OrganizationTableType.USER_GROUP_PERMISSIONS;
  protected domainType = OrganizationTableType.PERMISSION;

  constructor(
    protected tableService: TableService,
    protected userGroupService: UserGroupService
  ) {
    super(tableService);
  }

  /**
   *
   * @override
   * Loads all b2b users.
   *
   * @param code The user group code.
   */
  protected load(
    structure: TableStructure,
    code: string
  ): Observable<EntitiesModel<Permission>> {
    return this.userGroupService.getAvailableOrderApprovalPermissions(
      code,
      structure.options?.pagination
    );
  }

  /**
   * @override
   * Assign user to the user group.
   */
  assign(userGroupCode: string, permissionCode: string) {
    this.userGroupService.assignPermission(userGroupCode, permissionCode);
  }

  /**
   * @override
   * Unassigns the user from the user group.
   */
  unassign(userGroupCode: string, permissionCode: string) {
    this.userGroupService.unassignPermission(userGroupCode, permissionCode);
  }
}
