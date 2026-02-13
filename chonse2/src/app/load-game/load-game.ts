import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../app.routes';

@Component({
  selector: 'app-load-game',
  imports: [],
  templateUrl: './load-game.html',
  styleUrl: './load-game.css',
})
export class LoadGame implements OnInit {
  site!: string;
  username!: string;
  gameId!: string;

  constructor(private route: ActivatedRoute, private router: Router)
  {
    this.route.paramMap.subscribe(params => 
    {
      this.site = params.get(RouteConstants.ROUTE_SITE)!;
      this.username = params.get(RouteConstants.ROUTE_USERNAME)!;
      this.gameId = params.get(RouteConstants.ROUTE_GAMEID)!;
    });
  }

  ngOnInit(): void 
  {
    this.router.navigate(['/'], {state: {"site" : this.site, "username": this.username, "gameId": this.gameId}})
  }

  isError()
  {
    return (!this.site || !this.username || !this.gameId)
  }
}
