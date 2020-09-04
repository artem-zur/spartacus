import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { B2BUnitNode, Currency, CurrencyService } from '@spartacus/core';
import { Observable } from 'rxjs';
import { Budget } from '../../../core';
import { OrgUnitService } from '../../../core/services/org-unit.service';
import { OrganizationItemService } from '../../shared/organization-item.service';
import { BudgetItemService } from '../services/budget-item.service';

@Component({
  selector: 'cx-budget-form',
  templateUrl: './budget-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: OrganizationItemService,
      useExisting: BudgetItemService,
    },
  ],
})
export class BudgetFormComponent implements OnInit {
  form: FormGroup = this.itemService.getForm();

  units$: Observable<B2BUnitNode[]> = this.unitService.getActiveUnitList();
  currencies$: Observable<Currency[]> = this.currencyService.getAll();

  constructor(
    protected itemService: OrganizationItemService<Budget>,
    protected unitService: OrgUnitService,
    protected currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.unitService.loadList();
  }
}
