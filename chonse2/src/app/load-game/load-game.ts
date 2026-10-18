import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../app.routes';

@Component({
  selector: 'app-load-game',
  imports: [],
  templateUrl: './load-game.html',
  styleUrl: './load-game.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadGame implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  site!: string;
  username!: string;
  gameId!: string;

  constructor()
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
    this.router.navigate(['/analysis'], {state: {"site" : this.site, "username": this.username, "gameId": this.gameId}})
  }

  isError()
  {
    return (!this.site || !this.username || !this.gameId)
  }
}
