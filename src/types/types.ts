// src/types/types.ts
export type SubclassData = {
    description: string
    image: string
  }
  
  export type ClassData = {
    description: string
    image: string
    subclasses: {
      [subclassName: string]: SubclassData
    }
  }
  
  export type ClassDataMap = {
    [className: string]: ClassData
  }
  