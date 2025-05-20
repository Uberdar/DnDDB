// src/app/core/services/pin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Pin {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PinService {
  // Keep a cache of images to avoid excessive API calls
  private imageCache: { [category: string]: string[] } = {};
  
  // Track which items have been generated
  private generatedIds: Set<number> = new Set();
  
  // Picsum photo IDs that look fantasy-themed
  private readonly FANTASY_PHOTO_IDS = [
    '1060', '1082', '110', '119', '129', '137', '158', '167', '175', '195', 
    '204', '211', '219', '237', '24', '244', '256', '27', '279', '287', 
    '301', '306', '314', '329', '346', '386', '397', '428', '429', '445', 
    '452', '464', '473', '497', '54', '579', '59', '65', '652', '716', 
    '784', '810', '823', '838', '87', '96', '986'
  ];
  
  constructor(private http: HttpClient) {
    console.log('PinService constructor called');
    // Initialize the image cache
    this.preloadImages();
  }
  
  /**
   * Get pins with optional filtering and pagination
   */
  getPins(limit: number = 24, offset: number = 0, category?: string): Observable<Pin[]> {
    console.log(`PinService.getPins called with limit: ${limit}, offset: ${offset}`);
    // In a real app, this would call an API
    // For now, we'll generate mock data
    return of(this.generateMockPins(limit, offset, category));
  }
  
  /**
   * Get a single pin by ID
   */
  getPin(id: number): Observable<Pin | null> {
    console.log('PinService.getPin called with id:', id);
    // In a real app, this would call an API
    return of(this.generatePinWithId(id));
  }
  
  /**
   * Get a random image URL for a specific category
   */
  getRandomImageUrl(category: string): string {
    // Try to get from cache first
    if (this.imageCache[category] && this.imageCache[category].length > 0) {
      const randomIndex = Math.floor(Math.random() * this.imageCache[category].length);
      return this.imageCache[category][randomIndex];
    }
    
    // Fallback: generate a deterministic but random-looking URL
    if (category === 'Spells') {
      // Colorful abstract for spells
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    } else if (category === 'Characters') {
      // Character portraits
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    } else if (category === 'Locations') {
      // Landscape oriented for locations
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/300`;
    } else if (category === 'Maps') {
      // Square format for maps
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    } else if (category === 'Items') {
      // Items are smaller
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    } else if (category === 'Monsters') {
      // Monsters tend to be darker
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    } else {
      // Default image
      return `https://picsum.photos/id/${this.getRandomPhotoId()}/400/400`;
    }
  }
  
  /**
   * Preload some images into the cache to improve user experience
   */
  private preloadImages(): void {
    // Define categories
    const categories = ['Spells', 'Locations', 'Items', 'Characters', 'Maps', 'Monsters', 'default'];
    
    // For each category, cache a few image URLs
    categories.forEach(category => {
      this.imageCache[category] = [];
      
      // Add a few deterministic but varied URLs to the cache
      for (let i = 0; i < 5; i++) {
        this.imageCache[category].push(
          `https://picsum.photos/id/${this.getRandomPhotoId(i)}/400/400`
        );
      }
    });
  }
  
  /**
   * Get a random fantasy-themed photo ID from Picsum
   */
  private getRandomPhotoId(seed?: number): string {
    const index = seed !== undefined ? 
      seed % this.FANTASY_PHOTO_IDS.length : 
      Math.floor(Math.random() * this.FANTASY_PHOTO_IDS.length);
    return this.FANTASY_PHOTO_IDS[index];
  }
  
  /**
   * Generate a pin with a specific ID
   */
  private generatePinWithId(id: number): Pin {
    const categories = this.getCategories();
    const categoryIndex = (id - 1) % categories.length;
    const category = categories[categoryIndex];
    
    // Select a random description for variety
    const descIndex = Math.floor(Math.random() * category.descriptions.length);
    
    // Create tags
    const tags = ['DnD', 'Fantasy'];
    tags.push(category.name);
    
    // Add some variety
    if (id % 3 === 0) tags.push('RPG');
    if (id % 4 === 0) tags.push('Tabletop');
    
    return {
      id: id,
      title: `DnD ${category.name.slice(0, -1)} #${id}`,
      category: category.name,
      description: category.descriptions[descIndex],
      imageUrl: this.getRandomImageUrl(category.name),
      tags: tags
    };
  }
  
  /**
   * Generate mock pins for development
   */
  private generateMockPins(count: number = 24, offset: number = 0, filterCategory?: string): Pin[] {
    console.log(`PinService.generateMockPins called with count: ${count}, offset: ${offset}`);
    
    const categories = this.getCategories();
    const result: Pin[] = [];
    
    // Calculate starting ID based on offset
    let currentId = offset + 1;
    
    // Generate 'count' number of items
    for (let i = 0; i < count; i++) {
      // Ensure we have a unique ID
      while (this.generatedIds.has(currentId)) {
        currentId++;
      }
      
      // Select category (or use filtered category)
      const categoryIndex = (currentId - 1) % categories.length;
      const category = filterCategory ? 
        categories.find(c => c.name === filterCategory) : 
        categories[categoryIndex];
      
      if (!category) {
        currentId++;
        continue; // Skip if category not found
      }
      
      // Select a random description for variety
      const descIndex = Math.floor(Math.random() * category.descriptions.length);
      
      // Create tags
      const tags = ['DnD', 'Fantasy'];
      tags.push(category.name);
      
      // Add some variety
      if (currentId % 3 === 0) tags.push('RPG');
      if (currentId % 4 === 0) tags.push('Tabletop');
      
      // Create the pin
      const pin: Pin = {
        id: currentId,
        title: `DnD ${category.name.slice(0, -1)} #${currentId}`,
        category: category.name,
        description: category.descriptions[descIndex],
        imageUrl: this.getRandomImageUrl(category.name),
        tags: tags
      };
      
      // Add to result and mark as generated
      result.push(pin);
      this.generatedIds.add(currentId);
      
      // Move to next ID
      currentId++;
    }
    
    return result;
  }
  
  /**
   * Get category data
   */
  private getCategories() {
    return [
      { name: 'Spells', descriptions: [
        'A powerful spell to control the elements',
        'An ancient ritual from forgotten tomes',
        'A beginner\'s cantrip with surprising uses',
        'A spell of protection against malevolent forces',
        'A complex incantation requiring rare components'
      ]},
      { name: 'Locations', descriptions: [
        'An abandoned temple hidden in dense forests',
        'A bustling medieval town with a dark secret',
        'A treacherous mountain pass guarded by ancient beasts',
        'A mystical grove where fey creatures dwell',
        'A forgotten dungeon beneath an ancient castle'
      ]},
      { name: 'Items', descriptions: [
        'A legendary sword with mysterious engravings',
        'A magical amulet that grants strange powers',
        'A cursed ring sought by many adventurers',
        'An ancient tome containing forbidden knowledge',
        'A seemingly ordinary object with extraordinary abilities'
      ]},
      { name: 'Characters', descriptions: [
        'A brooding elven ranger with a troubled past',
        'A charismatic human bard collecting epic tales',
        'A wise dwarven cleric devoted to their deity',
        'A mysterious tiefling sorcerer with unknown origins',
        'A half-orc barbarian seeking redemption'
      ]},
      { name: 'Maps', descriptions: [
        'A detailed map of an unexplored region',
        'Ancient parchment showing hidden treasure locations',
        'A tactical battle map of a historic conflict',
        'A mystical map that reveals different locations depending on the phase of the moon',
        'A carefully illustrated dungeon layout with notes from previous explorers'
      ]},
      { name: 'Monsters', descriptions: [
        'A terrifying dragon that commands the weather',
        'A cunning shapeshifter infiltrating society',
        'An ancient undead creature bound to a cursed location',
        'A massive creature lurking in the depths',
        'A deceptively small being with immense magical powers'
      ]}
    ];
  }
}