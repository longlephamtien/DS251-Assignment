import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BookingTimeoutService } from './booking-timeout.service';

describe('BookingTimeoutService', () => {
  let service: BookingTimeoutService;
  let dataSource: DataSource;

  // Mock DataSource
  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingTimeoutService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BookingTimeoutService>(BookingTimeoutService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelExpiredBookings', () => {
    it('should call stored procedure with correct timeout parameter', async () => {
      // Arrange
      mockDataSource.query
        .mockResolvedValueOnce(undefined) // CALL sp_cancel_expired_bookings
        .mockResolvedValueOnce([{ cancelledCount: 0, failedCount: 0 }]); // SELECT output

      // Act
      await service.cancelExpiredBookings();

      // Assert
      expect(mockDataSource.query).toHaveBeenCalledWith(
        'CALL sp_cancel_expired_bookings(?, @p_cancelled_count, @p_failed_count);',
        [5], // TIMEOUT_MINUTES = 5
      );
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
      );
    });

    it('should not log when no bookings are cancelled', async () => {
      // Arrange
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: 0, failedCount: 0 }]);

      // Act
      await service.cancelExpiredBookings();

      // Assert
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should log warning when bookings are cancelled', async () => {
      // Arrange
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: 3, failedCount: 0 }]);

      // Act
      await service.cancelExpiredBookings();

      // Assert
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('3 cancelled, 0 failed'),
      );
    });

    it('should log warning when some bookings failed', async () => {
      // Arrange
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: 2, failedCount: 1 }]);

      // Act
      await service.cancelExpiredBookings();

      // Assert
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 cancelled, 1 failed'),
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Database connection lost');
      mockDataSource.query.mockRejectedValueOnce(error);

      // Act
      await service.cancelExpiredBookings();

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in cancelExpiredBookings'),
        error,
      );
    });
  });

  describe('manualCancelExpiredBookings', () => {
    it('should return cancelled and failed counts', async () => {
      // Arrange
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: '5', failedCount: '1' }]);

      // Act
      const result = await service.manualCancelExpiredBookings();

      // Assert
      expect(result).toEqual({
        cancelled: 5,
        failed: 1,
        message: 'Cleanup completed: 5 cancelled, 1 failed',
      });
    });

    it('should handle zero results', async () => {
      // Arrange
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: '0', failedCount: '0' }]);

      // Act
      const result = await service.manualCancelExpiredBookings();

      // Assert
      expect(result).toEqual({
        cancelled: 0,
        failed: 0,
        message: 'Cleanup completed: 0 cancelled, 0 failed',
      });
    });

    it('should log manual trigger', async () => {
      // Arrange
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: '0', failedCount: '0' }]);

      // Act
      await service.manualCancelExpiredBookings();

      // Assert
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Manual trigger'),
      );
    });

    it('should throw error when database fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockDataSource.query.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(service.manualCancelExpiredBookings()).rejects.toThrow(
        'Database error',
      );
    });

    it('should log error before throwing', async () => {
      // Arrange
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      const error = new Error('Database error');
      mockDataSource.query.mockRejectedValueOnce(error);

      // Act
      try {
        await service.manualCancelExpiredBookings();
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Manual cleanup failed'),
        error,
      );
    });
  });

  describe('TIMEOUT_MINUTES configuration', () => {
    it('should use configurable timeout value', async () => {
      // Arrange
      mockDataSource.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ cancelledCount: 0, failedCount: 0 }]);

      // Act
      await service.cancelExpiredBookings();

      // Assert - Verify timeout parameter is passed
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.any(String),
        [5], // Should be TIMEOUT_MINUTES value
      );
    });
  });
});
