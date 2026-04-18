import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reactiveform } from './reactiveform';

describe('Reactiveform', () => {
  let component: Reactiveform;
  let fixture: ComponentFixture<Reactiveform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reactiveform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reactiveform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
