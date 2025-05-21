// src/app/components/side-menu/side-menu.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagFilterComponent } from '../tag-filter/tag-filter.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, TagFilterComponent],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() tagFilterChange = new EventEmitter<string[]>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
  
  onFilterChange(tags: string[]) {
    this.tagFilterChange.emit(tags);
  }
}