import { Injectable, InjectionToken, Provider } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import * as fromNgrxRouter from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import { PageType } from '../../../model/cms.model';
import { RoutingConfigService } from '../../configurable-routes/routing-config.service';
import { CmsActivatedRouteSnapshot } from '../../models/cms-route';
import { PageContext } from '../../models/page-context.model';
import {
  ActivatedRouterStateSnapshot,
  RouterState,
  State,
} from '../routing-state';

export const initialState: RouterState = {
  navigationId: 0,
  state: {
    url: '',
    queryParams: {},
    params: {},
    context: {
      id: '',
    },
    cmsRequired: false,
    semanticRoute: undefined,
  },
  nextState: undefined,
};

export function getReducers(): ActionReducerMap<State> {
  return {
    router: reducer,
  };
}

export function reducer(
  state: RouterState = initialState,
  action: any
): RouterState {
  switch (action.type) {
    case fromNgrxRouter.ROUTER_NAVIGATION: {
      return {
        ...state,
        nextState: action.payload.routerState,
        navigationId: action.payload.event.id,
      };
    }

    case fromNgrxRouter.ROUTER_ERROR:
    case fromNgrxRouter.ROUTER_CANCEL: {
      return {
        ...state,
        nextState: undefined,
      };
    }

    case fromNgrxRouter.ROUTER_NAVIGATED: {
      return {
        state: action.payload.routerState,
        navigationId: action.payload.event.id,
        nextState: undefined,
      };
    }

    default: {
      return state;
    }
  }
}

export const reducerToken: InjectionToken<ActionReducerMap<
  State
>> = new InjectionToken<ActionReducerMap<State>>('RouterReducers');

export const reducerProvider: Provider = {
  provide: reducerToken,
  useFactory: getReducers,
};

/* The serializer is there to parse the RouterStateSnapshot,
and to reduce the amount of properties to be passed to the reducer.
 */
@Injectable()
export class CustomSerializer
  implements
    fromNgrxRouter.RouterStateSerializer<ActivatedRouterStateSnapshot> {
  serialize(routerState: RouterStateSnapshot): ActivatedRouterStateSnapshot {
    let state: CmsActivatedRouteSnapshot = routerState.root as CmsActivatedRouteSnapshot;
    let cmsRequired = false;
    let context: PageContext;
    let semanticRoute: string;
    let urlString = '';

    while (state.firstChild) {
      state = state.firstChild as CmsActivatedRouteSnapshot;
      urlString +=
        '/' + state.url.map((urlSegment) => urlSegment.path).join('/');

      // we use semantic route information embedded from any parent route
      if (state.data?.cxRoute) {
        semanticRoute = state.data?.cxRoute;
      }

      // we use context information embedded in Cms driven routes from any parent route
      if (state.data && state.data.cxCmsRouteContext) {
        context = state.data.cxCmsRouteContext;
      }

      // we assume, that any route that has CmsPageGuard or it's child
      // is cmsRequired
      if (
        !cmsRequired &&
        (context ||
          (state.routeConfig &&
            state.routeConfig.canActivate &&
            state.routeConfig.canActivate.find(
              (x) => x && x.guardName === 'CmsPageGuard'
            )))
      ) {
        cmsRequired = true;
      }
    }

    // If `semanticRoute` couldn't be already recognized using `data.cxRoute` property
    // let's lookup the routing configuration to find the semantic route that has exactly the same configured path as the current URL.
    // This will work only for simple URLs without any dynamic routing parameters.
    semanticRoute = semanticRoute || this.lookupSemanticRoute(urlString);

    const { params } = state;
    // we give smartedit preview page a PageContext
    if (state.url.length > 0 && state.url[0].path === 'cx-preview') {
      context = {
        id: 'smartedit-preview',
        type: PageType.CONTENT_PAGE,
      };
    } else {
      if (params['productCode']) {
        context = { id: params['productCode'], type: PageType.PRODUCT_PAGE };
      } else if (params['categoryCode']) {
        context = { id: params['categoryCode'], type: PageType.CATEGORY_PAGE };
      } else if (params['brandCode']) {
        context = { id: params['brandCode'], type: PageType.CATEGORY_PAGE };
      } else if (state.data.pageLabel !== undefined) {
        context = { id: state.data.pageLabel, type: PageType.CONTENT_PAGE };
      } else if (!context) {
        if (state.url.length > 0) {
          const pageLabel =
            '/' + state.url.map((urlSegment) => urlSegment.path).join('/');
          context = {
            id: pageLabel,
            type: PageType.CONTENT_PAGE,
          };
        } else {
          context = {
            id: 'homepage',
            type: PageType.CONTENT_PAGE,
          };
        }
      }
    }

    return {
      url: routerState.url,
      queryParams: routerState.root.queryParams,
      params,
      context,
      cmsRequired,
      semanticRoute,
    };
  }

  /**
   * Returns the semantic route name for given page label.
   *
   * *NOTE*: It works only for simple static urls that are equal to the page label
   * of cms-driven content page. For example: `/my-account/address-book`.
   *
   * It doesn't work for URLs with dynamic parameters. But such case can be handled
   * by reading the defined `data.cxRoute` from the Angular Routes.
   *
   * It doesn't work for cms-driven child routes, because the guessed page label
   * is longer than the real one (i.e. `/store-finder/view-all`). Only when backend
   * returns the correct one along with cms page data (i.e. `pageLabel: '/store-finder'`),
   * then it could be used. But it's too late for this serializer.
   *
   * This means that recognizing semantic route name of cms-driven child routes
   * is NOT SUPPORTED.
   *
   * @param path path to be found in the routing config
   */
  private lookupSemanticRoute(pageLabel: string): string {
    // Page label is assumed to start with `/`, but Spartacus configured paths
    // don't start with slash. So we remove the leading slash:
    return this.routingConfig.getRouteName(pageLabel.substr(1));
  }

  constructor(private routingConfig: RoutingConfigService) {}
}
