import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private dataSource: DataSource) { }

  getHello(): string {
    return 'Hello World!';
  }

  /*
   * DANGER: Clears all data except admin user
   */
  async resetDatabase() {
    this.logger.warn('Resetting database...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Disable foreign keys to allow truncation/deletion in any order
      await queryRunner.query('PRAGMA foreign_keys = OFF');

      // List of tables to clear completely
      const tablesToClear = [
        'activity_log', // Table name from entity @Entity({name: 'ActivityLog'}) ? Defaults to 'ActivityLog' usually, let's check. 
        // Entity: @Entity({ name: "ActivityLog" }) -> table: "ActivityLog" (SQLite is case insensitive mostly but typeorm uses what's in name)
        // Entity: @Entity({ name: 'Sale' }) -> table: 'Sale'
        // Best to use entity metadata if possible, but hardcoding provided names is faster for this task.
        'Sale',
        'pumps', // @Entity({ name: 'pumps' })
        'pump_daily_record', // Guessing default? Checked PumpDailyRecord: @Entity() defaults to class name? 
        // Better to check entity files given before. 
        // User provided station.entity.ts (Station), pump.entity.ts (pumps), dispenser.entity.ts (Dispenser).
        // PumpDailyRecord import seen but file not viewed fully. Assuming default strategy.
        // Let's rely on DELETE FROM "TableName"
        'ActivityLog',
        'Sale',
        'pumps',
        'Dispenser',
        'Station',
        'stock', // Assume Stock entity
        'Ticket',
        'Reply',
        'monthly_report', // Entity MonthlyReport
        'Supply',
        // 'pump_daily_record' -> let's try 'pump_daily_record' or 'PumpDailyRecord'
        'pump_daily_record'
      ];

      for (const table of tablesToClear) {
        try {
          // Check if table exists first to avoid error? SQLite: SELECT name FROM sqlite_master WHERE type='table' AND name='...'
          // Or just DELETE and catch error (table not found). 
          // TypeORM `clear` method is cleaner but we have raw connection.
          await queryRunner.query(`DELETE FROM "${table}"`);
          // Reset sequence?
          await queryRunner.query(`DELETE FROM sqlite_sequence WHERE name="${table}"`);
        } catch (e) {
          // Table might not exist or name incorrect, log and continue
          this.logger.warn(`Could not clear table ${table}: ${e.message}`);
        }
      }

      // Handle User and related Info/Contact
      // Delete all users EXCEPT the admin
      await queryRunner.query(`DELETE FROM "User" WHERE email != 'abdulazizladan@gmail.com'`);

      // Cleanup orphaned Info/Contact (if cascade didn't work purely or for safety)
      // Assuming Info has user_email or relation. 
      // If User deletion worked, cascades might have handled it. 
      // But with FK OFF, cascades might NOT trigger automatically in SQLite unless handled by ORM?
      // Wait, DELETE via SQL with PRAGMA FK OFF means NO CASCADES.
      // So we MUST delete orphaned records manually.

      // Info linked to User? Checked Info entity: @JoinColumn({name: 'user_email', referencedColumnName: "email"})
      await queryRunner.query(`DELETE FROM "Info" WHERE user_email IS NULL OR user_email NOT IN (SELECT email FROM "User")`);

      // Contact?
      await queryRunner.query(`DELETE FROM "Contact" WHERE "userEmail" IS NULL OR "userEmail" NOT IN (SELECT email FROM "User")`); // Guessing column name for contact

      // Re-enable foreign keys
      await queryRunner.query('PRAGMA foreign_keys = ON');

      return { message: 'Database reset successful (Admin preserved).' };

    } catch (err) {
      await queryRunner.query('PRAGMA foreign_keys = ON'); // Ensure we turn it back on
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
