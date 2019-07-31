import { Component, OnInit } from '@angular/core';
import { DBDataService } from './dbdata.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private db: DBDataService) { }

  public DBDATA;

  ngOnInit() {
    this.db.loaddb('mystor.db').then((DBDATA) => {
      this.DBDATA = DBDATA;
    });
  }

}
