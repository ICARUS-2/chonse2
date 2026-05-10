import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {

  constructor(private router: Router)
  {

  }

  ngOnInit()
  {
    this.router.navigate(["/analysis"]);
  }

}
