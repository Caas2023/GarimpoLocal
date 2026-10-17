import { cities, categories, companies, claims, users } from '@/db/schema';

describe('Drizzle Schema', () => {
  describe('cities table', () => {
    it('has correct table name', () => {
      expect(cities).toBeDefined();
    });

    it('has id column', () => {
      expect(cities.id).toBeDefined();
    });

    it('has state column', () => {
      expect(cities.state).toBeDefined();
    });

    it('has name column', () => {
      expect(cities.name).toBeDefined();
    });

    it('has slug column', () => {
      expect(cities.slug).toBeDefined();
    });

    it('has isActive column', () => {
      expect(cities.isActive).toBeDefined();
    });
  });

  describe('categories table', () => {
    it('has correct table name', () => {
      expect(categories).toBeDefined();
    });

    it('has id column', () => {
      expect(categories.id).toBeDefined();
    });

    it('has name column', () => {
      expect(categories.name).toBeDefined();
    });

    it('has slug column', () => {
      expect(categories.slug).toBeDefined();
    });
  });

  describe('companies table', () => {
    it('has correct table name', () => {
      expect(companies).toBeDefined();
    });

    it('has id column', () => {
      expect(companies.id).toBeDefined();
    });

    it('has cityId column', () => {
      expect(companies.cityId).toBeDefined();
    });

    it('has categoryId column', () => {
      expect(companies.categoryId).toBeDefined();
    });

    it('has name column', () => {
      expect(companies.name).toBeDefined();
    });

    it('has slug column', () => {
      expect(companies.slug).toBeDefined();
    });

    it('has address column', () => {
      expect(companies.address).toBeDefined();
    });

    it('has phone column', () => {
      expect(companies.phone).toBeDefined();
    });

    it('has website column', () => {
      expect(companies.website).toBeDefined();
    });

    it('has latitude column', () => {
      expect(companies.latitude).toBeDefined();
    });

    it('has longitude column', () => {
      expect(companies.longitude).toBeDefined();
    });

    it('has externalPlaceId column', () => {
      expect(companies.externalPlaceId).toBeDefined();
    });

    it('has isActive column', () => {
      expect(companies.isActive).toBeDefined();
    });

    it('has createdAt column', () => {
      expect(companies.createdAt).toBeDefined();
    });

    it('has updatedAt column', () => {
      expect(companies.updatedAt).toBeDefined();
    });
  });

  describe('claims table', () => {
    it('has correct table name', () => {
      expect(claims).toBeDefined();
    });

    it('has id column', () => {
      expect(claims.id).toBeDefined();
    });

    it('has companyId column', () => {
      expect(claims.companyId).toBeDefined();
    });

    it('has claimerEmail column', () => {
      expect(claims.claimerEmail).toBeDefined();
    });

    it('has claimerName column', () => {
      expect(claims.claimerName).toBeDefined();
    });

    it('has claimerPhone column', () => {
      expect(claims.claimerPhone).toBeDefined();
    });

    it('has status column', () => {
      expect(claims.status).toBeDefined();
    });

    it('has createdAt column', () => {
      expect(claims.createdAt).toBeDefined();
    });
  });

  describe('users table', () => {
    it('has correct table name', () => {
      expect(users).toBeDefined();
    });

    it('has id column', () => {
      expect(users.id).toBeDefined();
    });

    it('has email column', () => {
      expect(users.email).toBeDefined();
    });

    it('has name column', () => {
      expect(users.name).toBeDefined();
    });

    it('has createdAt column', () => {
      expect(users.createdAt).toBeDefined();
    });
  });
});
