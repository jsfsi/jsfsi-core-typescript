import { BaseEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class SimpleEntity extends BaseEntity {
  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn({ nullable: true })
  public updated: Date;

  @DeleteDateColumn({ nullable: true })
  public deleted: Date;
}
