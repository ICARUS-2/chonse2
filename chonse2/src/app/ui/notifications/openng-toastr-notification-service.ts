import { inject, Service } from "@angular/core";
import { NotificationService, NotificationType } from "./notification-service";
import { ToastrService } from "@openng/ngx-toastr";

@Service()
export class OpenNGToastrNotificationService extends NotificationService 
{
    private toastrService = inject(ToastrService);

    override notify(type: NotificationType, message: string): void 
    {
        switch (type) 
        {
            case 'success':
                this.toastrService.success(message);
                break;
            case 'error':
                this.toastrService.error(message);
                break;
            case 'info':
                this.toastrService.info(message);
                break;
            case 'warning':
                this.toastrService.warning(message);
                break;
            default:
                const unreachable: never = type;
                throw new Error(`Unhandled notification type: ${unreachable}`);
        }
    }
    
}