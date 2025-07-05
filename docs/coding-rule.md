# Coding Standards

## Common Rules

### Comments

- All comments in source files must be written in English.

### File Naming Convention

- All file names must be in **kebab-case**.

e.g.  

```sh
button.tsx
auth-utils.ts
```

### Function Declaration Style

- TypeScript functions must be written as **arrow functions**.

### Method Naming Convention

#### `handle〇〇` (Event Handler Naming)

- Methods that handle events for buttons or forms should be named in the format `handle + Target + Event`.

e.g.  

```tsx
const handleFormSubmit = () => { /* process */ };
const handleButtonClick = () => { /* process */ };
```

---

## React Rules

### Usage of Actions in React Router

- **Normal form submission (with page transition)** → `<Form>` + `<button>`
- **Asynchronous request without page transition (AJAX)** → `fetcher.Form` or `fetcher.submit`
- **Calling `action` on button click, etc. (without page transition)** → `fetcher.submit`
- **Programmatically submitting a `<Form>` (with page transition)** → `useSubmit`

---

## UI Components

### Button

#### Usage of `variant`

The **`variant`** of a button should be used according to the following rules.

| Type | Purpose | Example |
|------|------|----|
| **Default Button (`default`)** | Primary actions | Create, Edit, Submit, Save |
| **Secondary Button (`secondary`)** | Complementary actions | Details, Next, Additional Settings |
| **Destructive Button (`destructive`)** | Irreversible actions (warning required) | Delete, Delete Account, Erase Data |
| **Outline Button (`outline`)** | Auxiliary actions (less prominent) | Cancel, Back, Save for Later |

### NavLink

Styles for `isActive` and `isPending` should be applied according to the following rules.

- isActive = true: Dark text color, with background color
- isActive = false & isPending = true: Light text color
- isActive = false & isPending = false: Default text color

e.g.  

```tsx
className={({ isActive, isPending }) =>
  isActive
    ? 'rounded-lg bg-blue-600 font-bold text-white'
    : isPending
      ? 'text-blue-400'
      : 'text-primary'
}
```

---

## Examples

Refer to the following examples for how to write code.

### route.tsx

#### Server Data Loading

```tsx
import type { Route } from "./+types/route";
import { fakeDb } from "../db";

export const loader = async({ params }: Route.LoaderArgs) => {
  const product = await fakeDb.getProduct(params.pid);
  return product;
}

const Product = ({
  loaderData,
}: Route.ComponentProps) => {
  const { name, description } = loaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}

export default Product;
```

### Storybook

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Button',
  },
};
