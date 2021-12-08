import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;

  @Index()
  @Column({
    nullable: true,
    select: false,
  })
  marketCap: number;
}
