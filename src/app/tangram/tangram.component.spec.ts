import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TangramComponent } from './tangram.component';

describe('TangramComponent', () => {
  let component: TangramComponent;
  let fixture: ComponentFixture<TangramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TangramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TangramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
