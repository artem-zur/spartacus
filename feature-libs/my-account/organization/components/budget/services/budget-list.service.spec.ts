import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EntitiesModel } from '@spartacus/core';
import { Budget, BudgetService } from '@spartacus/my-account/organization/core';
import { TableService, TableStructure } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { BudgetListService } from './budget-list.service';

const mockBudgetEntities: EntitiesModel<Budget> = {
  values: [
    {
      currency: {
        isocode: 'USD',
      },
    },
  ],
};

class MockBudgetService {
  getList(): Observable<EntitiesModel<Budget>> {
    return of(mockBudgetEntities);
  }
}

@Injectable()
class MockTableService {
  buildStructure(type): Observable<TableStructure> {
    return of({ type });
  }
}

describe('BudgetListService', () => {
  let service: BudgetListService;

  describe('with table config', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          BudgetListService,
          {
            provide: BudgetService,
            useClass: MockBudgetService,
          },
          {
            provide: TableService,
            useClass: MockTableService,
          },
        ],
      });
      service = TestBed.inject(BudgetListService);
    });

    it('should inject service', () => {
      expect(service).toBeTruthy();
    });

    it('should return "code" key', () => {
      expect(service.key()).toEqual('code');
    });

    it('should populate currency object to currency string literal', () => {
      let result;
      service.getTable().subscribe((table) => (result = table));
      expect(result.data[0].currency).toEqual('USD');
    });
  });
});
