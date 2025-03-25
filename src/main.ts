import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  //app.useGlobalGuards(new JwtAuthGuard(), new RolesGuard(null));

  const config = new DocumentBuilder()
    .setTitle('Pigeon API')
    .setDescription('Pigeon Fueling Station API')
    .setBasePath('localhost')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Fueling station management app')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap(); 
