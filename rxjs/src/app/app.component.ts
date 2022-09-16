import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  combineLatest,
  filter,
  forkJoin,
  map,
  mergeMap,
  Observable,
  Subject,
  Subscription,
  switchMap,
  debounceTime
} from 'rxjs';
import { MockDataService } from './mock-data.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  searchTermByCharacters = new Subject<string>();
  charactersResults$: Observable<any>;
  planetAndCharactersResults$: Observable<any>;
  loadingSubscription?: Subscription;
  isLoading: boolean = false;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.initLoadingState();
    this.initCharacterEvents();
  }

  changeCharactersInput(element): void {
    const inputValue: string = element.target.value;
    this.searchTermByCharacters.next(inputValue)
  }

  initCharacterEvents(): void {
    this.charactersResults$ = this.searchTermByCharacters
      .pipe(filter(searchText => searchText.length > 3), 
        debounceTime(500),
        mergeMap((searchText) => this.mockDataService.getCharacters(searchText))
        )
  }

  loadCharactersAndPlanet(): void {
    // 4. On clicking the button 'Load Characters And Planets', it is necessary to process two requests and combine the results of both requests into one result array. As a result, a list with the names of the characters and the names of the planets is displayed on the screen.
    // Your code should looks like this: this.planetAndCharactersResults$ = /* Your code */
    this.planetAndCharactersResults$ = forkJoin([
      this.mockDataService.getCharacters(),
      this.mockDataService.getPlatents()
    ]).pipe(
      map(([characters, planets]) => {
        return [...characters, ...planets]
      })
    )
  }

  initLoadingState(): void {
    /* 5.1. Let's add loader logic to our page. For each request, we have an observable that contains the state of the request. When we send a request the value is true, when the request is completed, the value becomes false. You can get value data with mockDataService.getCharactersLoader() and mockDataService.getPlanetLoader().
    
    - Combine the value of each of the streams.
    - Subscribe to changes
    - Check the received value using the areAllValuesTrue function and pass them to the isLoading variable. */
    this.loadingSubscription = combineLatest([
      this.mockDataService.getCharactersLoader(),
      this.mockDataService.getPlanetLoader()
    ]).subscribe((loadingValue) => this.isLoading = this.areAllValuesTrue(loadingValue))
  }

  ngOnDestroy(): void {
    // 5.2 Unsubscribe from all subscriptions
    if(this.loadingSubscription) {
      this.loadingSubscription.unsubscribe()
    }
  }

  areAllValuesTrue(elements: boolean[]): boolean {
    return elements.every((el) => el);
  }
}
