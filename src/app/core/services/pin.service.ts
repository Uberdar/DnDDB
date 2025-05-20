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
  
  // Track used image URLs to avoid duplicates
  private usedImageUrls: Set<string> = new Set();
  
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
   * Get a completely random image URL
   * Using a different approach for each request to ensure randomness
   */
  getRandomImageUrl(category: string, pinId?: number): string {
    // Use cache first if available
    if (this.imageCache[category] && this.imageCache[category].length > 0) {
      // Randomly select from cache but avoid duplicates if possible
      let availableImages = this.imageCache[category].filter(url => !this.usedImageUrls.has(url));
      
      // If all are used, generate a new random one instead of using cache
      if (availableImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const url = availableImages[randomIndex];
        this.usedImageUrls.add(url);
        return url;
      }
    }
    
    // Generate a completely random image URL
    return this.generateRandomImageUrl(category, pinId);
  }
  
  /**
   * Generate a completely random image URL
   */
  private generateRandomImageUrl(category: string, pinId?: number): string {
    // Create random dimensions for more variety
    let width, height;
    
    // Different dimensions based on category for visual variety
    if (category === 'Locations') {
      // Landscape format for locations
      width = this.getRandomInt(350, 600);
      height = this.getRandomInt(200, 350);
    } else if (category === 'Maps') {
      // More square format for maps
      width = this.getRandomInt(350, 500);
      height = this.getRandomInt(350, 500);
    } else if (category === 'Items') {
      // Smaller for items
      width = this.getRandomInt(300, 400);
      height = this.getRandomInt(300, 400);
    } else {
      // Default size for other categories
      width = this.getRandomInt(300, 500);
      height = this.getRandomInt(300, 500);
    }
    
    // Use one of these approaches for random images:
    
    // Approach 1: Completely random image (no ID)
    // const url = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
    
    // Approach 2: Random seeded by pin ID to make it reproducible but still random
    // const seed = pinId ? pinId : Math.floor(Math.random() * 1000);
    // const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
    
    // Approach 3: Random ID from the entire Picsum library (over 1000 images)
    const randomId = this.getRandomInt(1, 1084); // Picsum has photos numbered approximately up to 1084
    const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
    
    // Check if this exact URL has been used
    if (this.usedImageUrls.has(url)) {
      // If duplicate, try again with different parameters
      return this.generateRandomImageUrl(category, pinId);
    }
    
    // Track this URL to avoid duplicates
    this.usedImageUrls.add(url);
    return url;
  }
  
  /**
   * Generate a random integer between min and max (inclusive)
   */
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      
      // Add several random URLs to the cache
      for (let i = 0; i < 10; i++) {
        const url = this.generateRandomImageUrl(category);
        this.imageCache[category].push(url);
      }
    });
  }
  
  /**
   * Generate a pin with a specific ID
   */
  private generatePinWithId(id: number): Pin {
    const categories = this.getCategories();
    const categoryIndex = (id - 1) % categories.length;
    const category = categories[categoryIndex];
    
    // Use ID to deterministically select a description
    const descIndex = id % category.descriptions.length;
    
    // Create tags
    const tags = ['DnD', 'Fantasy'];
    tags.push(category.name);
    
    // Add some variety
    if (id % 3 === 0) tags.push('RPG');
    if (id % 4 === 0) tags.push('Tabletop');
    if (id % 5 === 0) tags.push('Adventure');
    if (id % 6 === 0) tags.push('Campaign');
    
    return {
      id: id,
      title: `DnD ${category.name.slice(0, -1)} #${id}`,
      category: category.name,
      description: category.descriptions[descIndex],
      imageUrl: this.getRandomImageUrl(category.name, id),
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
      
      // Use ID to deterministically select a description
      const descIndex = currentId % category.descriptions.length;
      
      // Create tags
      const tags = ['DnD', 'Fantasy'];
      tags.push(category.name);
      
      // Add some variety
      if (currentId % 3 === 0) tags.push('RPG');
      if (currentId % 4 === 0) tags.push('Tabletop');
      if (currentId % 5 === 0) tags.push('Adventure');
      if (currentId % 6 === 0) tags.push('Campaign');
      
      // Create the pin
      const pin: Pin = {
        id: currentId,
        title: `DnD ${category.name.slice(0, -1)} #${currentId}`,
        category: category.name,
        description: category.descriptions[descIndex],
        imageUrl: this.getRandomImageUrl(category.name, currentId),
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