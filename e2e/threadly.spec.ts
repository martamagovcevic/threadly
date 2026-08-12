import { expect, test } from '@playwright/test'

test('a guest can search the public catalog', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Find your next favorite' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Search the rack' }).fill('Leather Jacket')
  await expect(page.getByRole('heading', { name: '90s Leather Jacket' })).toBeVisible()
})

test('a new seller can create a listing', async ({ page }) => {
  const email = `seller-${Date.now()}@example.test`
  await page.goto('/account')
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Name').fill('E2E Seller')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Join Threadly' }).click()
  await page.getByRole('link', { name: 'Sell' }).click()
  await page.getByLabel('Name').fill('E2E Velvet Blazer')
  await page.getByLabel('Description').fill('A carefully kept vintage blazer.')
  await page.getByLabel('Price (USD)').fill('64')
  await page.getByRole('button', { name: 'Publish listing' }).click()
  await expect(page.getByText('Listing published.')).toBeVisible()
  await expect(page.getByText('E2E Velvet Blazer')).toBeVisible()
})

test('a buyer can purchase an item and see the order', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())
  const email = `buyer-${Date.now()}@example.test`
  await page.goto('/account')
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.getByLabel('Name').fill('E2E Buyer')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Join Threadly' }).click()
  await page.getByRole('button', { name: 'Buy now' }).first().click()
  await page.getByRole('link', { name: 'Orders' }).click()
  await expect(page.getByRole('heading', { name: 'Order history' })).toBeVisible()
  await expect(page.getByText(/Purchased/).first()).toBeVisible()
})
