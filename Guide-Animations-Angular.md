# Guide d'Implémentation des Animations Angular
## Gestionnaire de Projets - Ajout/Suppression de Projets et Tâches

---

## 📋 Vue d'ensemble

Ce guide vous explique comment ajouter des animations fluides lors de l'ajout et de la suppression de projets et de tâches dans votre application Angular.

---

## 🎯 Résultat attendu

- **Animation d'entrée** : Les nouveaux projets/tâches apparaissent avec un effet de glissement et de fondu
- **Animation de sortie** : Les projets/tâches supprimés disparaissent avec un effet de fondu
- **Animation de liste** : Les éléments se réorganisent en douceur lors d'ajouts/suppressions

---

## 🔧 Étape 1 : Importer les modules d'animation

### Fichier : `src/app/features/projects/components/project-list/project-list.ts`

**Ajouter les imports suivants au début du fichier :**

```typescript
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
```

---

## 🎨 Étape 2 : Définir les animations

### Dans le décorateur @Component, ajouter la propriété `animations` :

```typescript
@Component({
  selector: 'app-project-list',
  standalone: true, 
  templateUrl: './project-list.html',
  imports: [CommonModule, FormsModule, PriorityColorPipe],
  styleUrls: ['./project-list.css'],
  animations: [
    // Animation pour les projets
    trigger('projectAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100px)' }))
      ])
    ]),

    // Animation pour les tâches
    trigger('taskAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, height: '0px', transform: 'scale(0.8)' }))
      ])
    ]),

    // Animation pour la liste (effet de cascade)
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger('50ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
```

---

## 📝 Étape 3 : Appliquer les animations au template

### Fichier : `src/app/features/projects/components/project-list/project-list.html`

**Modifier la section des projets (ligne ~55) :**

```html
<!-- AVANT -->
<div class="space-y-4">
  @for(project of filteredProjects; track project.id) {
  <div class="bg-white shadow rounded-lg p-6">

<!-- APRÈS -->
<div class="space-y-4" [@listAnimation]="filteredProjects.length">
  @for(project of filteredProjects; track project.id) {
  <div class="bg-white shadow rounded-lg p-6" [@projectAnimation]>
```

**Modifier la section des tâches (ligne ~125) :**

```html
<!-- AVANT -->
<div class="space-y-2">
  @for(task of project.tasks; track task.id) {
  <div class="border-l-4 p-4 rounded-r-lg" [ngClass]="{

<!-- APRÈS -->
<div class="space-y-2">
  @for(task of project.tasks; track task.id) {
  <div class="border-l-4 p-4 rounded-r-lg" [@taskAnimation] [ngClass]="{
```

---

## ⚡ Étape 4 : Optimisation CSS (Optionnel)

### Fichier : `src/app/features/projects/components/project-list/project-list.css`

**Ajouter ces styles pour une meilleure performance :**

```css
/* Optimisation des animations */
.space-y-4 > div,
.space-y-2 > div {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Transition fluide pour les réorganisations */
.space-y-4,
.space-y-2 {
  transition: all 0.3s ease;
}
```

---

## 🎬 Animations personnalisées (Options avancées)

### Option 1 : Animation avec rebond

```typescript
trigger('bounceIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.3)' }),
    animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
      style({ opacity: 1, transform: 'scale(1)' }))
  ])
])
```

### Option 2 : Animation de glissement latéral

```typescript
trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
])
```

### Option 3 : Animation avec rotation

```typescript
trigger('rotateIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'rotateX(-90deg)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'rotateX(0deg)' }))
  ])
])
```

---

## 🔍 Résolution des problèmes courants

### Problème 1 : Les animations ne fonctionnent pas
**Solution :** Vérifiez que vous avez bien importé `BrowserAnimationsModule` dans votre `app.config.ts` ou `main.ts` :

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // ... autres providers
  ]
};
```

### Problème 2 : Les animations sont saccadées
**Solution :** Ajoutez `will-change` dans le CSS (voir Étape 4)

### Problème 3 : Les éléments ne disparaissent pas lors de la suppression
**Solution :** Assurez-vous d'utiliser `track` dans votre `@for` (déjà présent dans votre code)

---

## 📊 Comparaison des animations

| Type d'animation | Durée | Meilleur usage | Performance |
|-----------------|-------|----------------|-------------|
| Fade + Slide | 300ms | Projets | ⭐⭐⭐⭐⭐ |
| Scale | 250ms | Tâches | ⭐⭐⭐⭐ |
| Bounce | 400ms | Modals | ⭐⭐⭐ |
| Rotate | 400ms | Cartes | ⭐⭐⭐ |

---

## ✅ Checklist finale

- [ ] Imports d'animation ajoutés dans le fichier TypeScript
- [ ] Triggers d'animation définis dans le décorateur @Component
- [ ] Animations appliquées aux éléments du template
- [ ] CSS d'optimisation ajouté (optionnel)
- [ ] Tests effectués dans le navigateur
- [ ] Performance vérifiée (pas de lag)

---

## 🎓 Pour aller plus lus

### Documentation officielle Angular
- [Guide des animations](https://angular.dev/guide/animations)
- [API des animations](https://angular.dev/api/animations)

### Exemples de timing functions
- `ease` - Démarrage et fin lents
- `ease-in` - Démarrage lent
- `ease-out` - Fin lente
- `ease-in-out` - Démarrage et fin très lents
- `linear` - Vitesse constante
- `cubic-bezier(n,n,n,n)` - Personnalisé

---

## 📧 Support

Si vous rencontrez des problèmes lors de l'implémentation, vérifiez :
1. La version d'Angular (doit être >= 17 pour la syntaxe @for)
2. Que `provideAnimations()` est bien configuré
3. Que les imports sont corrects
4. La console du navigateur pour les erreurs

---

**Date de création :** Avril 2026  
**Version Angular :** 17+  
**Auteur :** GitHub Copilot CLI
