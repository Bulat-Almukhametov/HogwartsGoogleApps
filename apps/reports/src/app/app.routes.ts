import { Route } from '@angular/router';
import { AnnualReportComponent } from './components/pages/annual-report/annual-report.component';
import { StudentInfoComponent } from './components/pages/student-info/student-info.component';
import { EventsComponent } from './components/pages/events/events.component';

export const appRoutes: Route[] = [
  { path: 'annual', component: AnnualReportComponent },
  { path: 'students', component: StudentInfoComponent },
  { path: 'events', component: EventsComponent },
];
