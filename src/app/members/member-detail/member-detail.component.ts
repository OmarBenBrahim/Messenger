import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from 'src/app/models/member';
import { MembersService } from 'src/app/services/members.service';
import { NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { NgxGalleryImage } from '@kolkov/ngx-gallery';
import { NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { MessageService } from 'src/app/services/message.service';
import { Message } from 'src/app/models/message';
import { PresenceService } from 'src/app/services/presence.service';
import { AccountService } from 'src/app/services/account.service';
import { User } from 'src/app/models/user';
import { take } from 'rxjs';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs' , {static : true}) memberTabs?: TabsetComponent;
  member : Member = {} as Member;
  galleryOptions : NgxGalleryOptions[] = [];
  galleryImages : NgxGalleryImage[] = [];
  activeTab?: TabDirective;
  messages : Message[] = [];
  user? : User ;
  constructor(private accountService : AccountService, private route : ActivatedRoute,
    private messageService : MessageService , public presenceService : PresenceService,
    private router : Router) {
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next : user =>{
          if(user){
            this.user = user
          }
        } 
      });
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
   }
 

  ngOnInit(): void {
    this.route.data.subscribe({
      next : data => this.member = data['member']
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab']);
      }
    })
    
    this.galleryOptions = [
      {
        width: '500px',
        height : '500px',
        imagePercent: 100 ,
        thumbnailsColumns: 4,
        imageAnimation : NgxGalleryAnimation.Slide,
        preview : false
      }
    ];
    this.galleryImages = this.getImages();
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  getImages(){
    if(!this.member) return[] ;
    const imageUrls = [];
    for(const photo of this.member.photos){
      imageUrls.push({
        small : photo.url,
        medium : photo.url,
        big : photo.url,
      })
    }
    return imageUrls;
  }
  
  /*
  loadMember(){
    const username = this.route.snapshot.paramMap.get('username');
    
    if(!username) return;
    this.memberService.getMember(username).subscribe({
      next : member => {
        this.member = member;
        this.galleryImages = this.getImages();
      }
    })
  }
  */

  selectTab(heading : string){
    if(this.memberTabs){
      this.memberTabs.tabs.find(x => x.heading === heading)!.active = true ;
    }
  }

  loadMessages(){
    if(this.member){
      this.messageService.getMessagesThread(this.member.userName).subscribe({
        next: messages => this.messages = messages
      })
    }
  }

  onTabActivated(data : TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages' && this.user){
      this.messageService.createHubConnection(this.user , this.member.userName);
    }else{
      this.messageService.stopHubConnection();
    }
  }

}
