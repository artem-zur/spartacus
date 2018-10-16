import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AbstractStoreItemComponent } from '../abstract-store-item/abstract-store-item.component';

import { StoreDataService } from '../../services/index';
import * as fromStore from '../../store';

@Component({
  selector: 'y-store-finder-store-description',
  templateUrl: './store-finder-store-description.component.html',
  styleUrls: ['./store-finder-store-description.component.scss']
})
export class StoreFinderStoreDescriptionComponent
  extends AbstractStoreItemComponent
  implements OnInit, OnDestroy {
  location: any;
  ngUnsubscribe: Subscription;

  constructor(
    private store: Store<fromStore.StoresState>,
    protected storeDataService: StoreDataService,
    private route: ActivatedRoute
  ) {
    super(storeDataService);
  }

  ngOnInit(): void {
    this.ngUnsubscribe = this.store
      .pipe(select(fromStore.getFindStoresEntities))
      .subscribe(locations => {
        const stores = locations.stores;
        if (stores) {
          this.location = stores.filter(
            (store: any) => store.name === this.route.snapshot.params.store
          )[0];
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.unsubscribe();
  }
}
